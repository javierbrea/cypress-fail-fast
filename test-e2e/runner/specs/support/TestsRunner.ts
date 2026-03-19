import type { FailFastConfig } from "cypress-fail-fast";

import { pnpmRun } from "./CommandRunner";
import { splitLogsBySpec } from "./Logs";

/** Configuration for a single test retry, used in the expected spec results. */
type RetryConfig = {
  /** Number of attempts for the test (retries + 1) */
  attempts: number;
  /** Description of the retried test */
  test: string;
};

/**
 * Configuration for the optional hooks that can be used to coordinate fail-fast state across runs.
 */
type HooksConfig = {
  /** When `true`, the `onFailFastTriggered` hook will be enabled. It simply logs the strategy and failed test when fail-fast is triggered. */
  enableOnFailFastTriggered?: boolean;
  /** Expected log message when the `onFailFastTriggered` hook is enabled. */
  expectFailFastTriggeredLog?: {
    /* Strategy used when triggering fail-fast mode. It can be either `"spec"` or `"run"`. */
    strategy: FailFastConfig["failFastStrategy"];
    /* Failed test that triggers fail-fast mode. It has to have `name` and `fullTitle` properties. */
    test: {
      /* Test title without parent suites. */
      name: string;
      /* Full test title including parent suites. */
      fullTitle: string;
    };
  };
  /** When `true`, the `shouldTriggerFailFast` hook will be enabled. It has to be enabled together with `enableSkipModeAfterTests` to have an effect. */
  enableShouldTriggerFailFast?: boolean;
  /** Number of failed tests required to trigger fail-fast mode when `shouldTriggerFailFast` is enabled. */
  enableSkipModeAfterTests?: number;
};

/** Expected test counts for a single Cypress spec file. */
interface SpecExpectedStatuses {
  /** Number of executed tests, or `null`/`undefined` to skip this assertion. */
  executed?: number | null;
  /** Number of passing tests, or `null`/`undefined` to skip this assertion. */
  passed?: number | null;
  /** Number of failing tests, or `null`/`undefined` to skip this assertion. */
  failed?: number | null;
  /** Number of pending tests, or `null`/`undefined` to skip this assertion. */
  pending?: number | null;
  /** Number of skipped tests, or `null`/`undefined` to skip this assertion. */
  skipped?: number | null;
  /** Optional array of retries expected for this spec. */
  retries?: RetryConfig[];
}

/** {@link SpecExpectedStatuses} with the resolved 1-based spec index attached. */
interface ResolvedSpecStatuses extends SpecExpectedStatuses {
  /** 1-based index of the spec file within the run. */
  spec: number;
}

/** Options accepted by {@link runSpecsTests}. */
type RunSpecsTestsOptions = {
  /** Name of the Cypress variant directory to run tests in. */
  cypressVariant: string;
  /** Subfolder inside the variant's `cypress/e2e` directory that contains the specs. */
  specsFolder?: string;
  /** One entry per spec file, describing the expected test-status counts. */
  specsResults: SpecExpectedStatuses[];
  /** Optional global fail-fast configuration to apply during the run. */
  config?: FailFastConfig;
  /** If `true`, only this test suite will be executed, skipping all others. */
  only?: boolean;
  /** Optional hooks configuration to apply during the run. */
  hooks?: HooksConfig;
};

/**
 * A function that returns the raw log output for a given 1-based spec index.
 *
 * Index `0` contains the preamble text before the first spec; index `1` is the
 * first spec's log, index `2` the second, and so on.
 */
type GetLogs = (specIndex: number) => string;

/**
 * Returns the plural form of `text` when `amount` is 2 or more.
 *
 * @param text - The singular word to optionally pluralize.
 * @param amount - The quantity used to decide whether to pluralize.
 * @returns The original word, or the word with an `"s"` suffix appended.
 */
const pluralize = (text: string, amount: number): string => {
  return amount < 2 ? text : `${text}s`;
};

/**
 * Creates a Jest `it` block that asserts a particular test-status count appears
 * in the spec log output. When `amount` is `null` or `undefined` the block is
 * skipped entirely.
 *
 * @param status - Human-readable status label used in the test description (e.g. `"passed"`).
 * @param statusKey - The Cypress summary-table key to match (e.g. `"Passing"`).
 * @param amount - Expected count, or `null`/`undefined` to skip the assertion.
 * @param getSpecLogs - Callback that returns the log string for the current spec.
 */
const expectTestsAmount = (
  status: string,
  statusKey: string,
  amount: number | null | undefined,
  getSpecLogs: () => string,
): void => {
  if (amount !== null && amount !== undefined) {
    it(`should have ${status} ${amount} ${pluralize("test", amount)}`, () => {
      expect(getSpecLogs()).toEqual(
        expect.stringMatching(
          new RegExp(`\\s*│\\s*${statusKey}:\\s*${amount}`),
        ),
      );
    });
  }
};

/**
 * Expects the `onFailFastTriggered` hook to have been called with the provided strategy and test information, by matching the spec logs with a regex.
 * @param param0 - Expected strategy and failed test information to be included in the log message.
 * @param getSpecLogs - Callback that returns the log string for the current spec.
 */
const expectFailFastTriggeredHookToHaveBeenCalled = (
  { strategy, test: failedTest }: HooksConfig["expectFailFastTriggeredLog"] = {
    strategy: "spec",
    test: {
      name: "please provide a test name",
      fullTitle: "please provide a full test title",
    },
  },
  getSpecLogs: () => string,
) => {
  it(`onFailFastTriggered hook should log the strategy and failed test information when fail-fast mode is triggered`, () => {
    expect(getSpecLogs()).toEqual(
      expect.stringMatching(
        new RegExp(
          `Fail-fast triggered with strategy "${strategy}" by test "${failedTest.fullTitle}"`,
        ),
      ),
    );
  });
};

/**
 * Expects the `shouldTriggerFailFast` hook to have been called a certain number of tests
 * @param numberOfTestsToTriggerSkip - The number of tests after which the hook should be triggered.
 * @param getSpecLogs - Callback that returns the log string for the current spec.
 */
const expectShouldTriggerFailFastHookToHaveBeenCalled = (
  numberOfTestsToTriggerSkip: number,
  getSpecLogs: () => string,
) => {
  it(`shouldTriggerFailFast should have enabled fail-fast after ${numberOfTestsToTriggerSkip} tests executed`, () => {
    expect(getSpecLogs()).toEqual(
      expect.stringMatching(
        // Custom shouldTriggerFailFast hook triggered fail-fast mode after ${executedTests} tests executed
        new RegExp(
          `Custom shouldTriggerFailFast hook triggered fail-fast mode after ${numberOfTestsToTriggerSkip} tests executed`,
        ),
      ),
    );
  });
};

/**
 * Creates a `describe` block for a single spec file and registers `it` assertions
 * for every non-null status count defined in `specStatuses`.
 *
 * @param specStatuses - Expected counts plus the 1-based index of the spec file.
 * @param getLogs - Function that returns the raw log string for a given spec index.
 */
const getSpecTests = (
  {
    spec = 1,
    executed = null,
    passed = null,
    failed = null,
    pending = null,
    skipped = null,
    retries = [],
  }: ResolvedSpecStatuses,
  getLogs: GetLogs,
): void => {
  const getSpecLogs = (): string => getLogs(spec);
  describe(`Spec ${spec}`, () => {
    expectTestsAmount("executed", "Tests", executed, getSpecLogs);
    expectTestsAmount("passed", "Passing", passed, getSpecLogs);
    expectTestsAmount("failed", "Failing", failed, getSpecLogs);
    expectTestsAmount("pending", "Pending", pending, getSpecLogs);
    expectTestsAmount("skipped", "Skipped", skipped, getSpecLogs);
    retries.forEach(({ attempts, test: testDescription }) => {
      it(`should have ${attempts} attempt(s) for "${testDescription}"`, () => {
        expect(getSpecLogs()).toEqual(
          // should display first item (failed) (attempt 3)
          expect.stringMatching(
            new RegExp(
              `\\s*${testDescription} \\(failed\\)\\s*\\(attempt ${attempts}\\)`,
            ),
          ),
        );
      });
    });
  });
};

/**
 * Builds a callback that iterates over an array of per-spec expectations and
 * registers `describe` / `it` blocks for each one.
 *
 * @param specsExpectedStatuses - One entry per spec file with the expected test counts.
 * @returns A function that, when called with a `GetLogs` callback, creates all spec tests.
 */
const getSpecsStatusesTests = (
  specsExpectedStatuses: SpecExpectedStatuses[],
  hooks?: HooksConfig,
): ((getLogs: GetLogs) => void) => {
  const {
    enableOnFailFastTriggered,
    expectFailFastTriggeredLog,
    enableShouldTriggerFailFast,
    enableSkipModeAfterTests,
  } = hooks ?? {};
  return (getLogs: GetLogs): void => {
    const getAllLogs = (): string => {
      return specsExpectedStatuses.reduce(
        (acc, _, index) => acc + getLogs(index + 1),
        "",
      );
    };

    const shouldTestTriggerHook =
      enableShouldTriggerFailFast && enableSkipModeAfterTests !== undefined;
    const shouldTestTriggeredHook =
      enableOnFailFastTriggered && expectFailFastTriggeredLog;

    if (shouldTestTriggerHook || shouldTestTriggeredHook) {
      describe("hooks", () => {
        if (shouldTestTriggerHook) {
          expectShouldTriggerFailFastHookToHaveBeenCalled(
            enableSkipModeAfterTests,
            getAllLogs, // The hook is triggered before any test execution, so it will be included in the preamble logs.
          );
        }
        if (shouldTestTriggeredHook) {
          expectFailFastTriggeredHookToHaveBeenCalled(
            expectFailFastTriggeredLog,
            getAllLogs, // The hook is triggered after a test failure, so it will be included in the last spec's logs.
          );
        }
      });
    }
    specsExpectedStatuses.forEach((specExpectedStatuses, index) => {
      getSpecTests({ ...specExpectedStatuses, spec: index + 1 }, getLogs);
    });
  };
};

/**
 * Runs a Cypress variant inside a `describe` block, waits for the Cypress run
 * to complete, then delegates log assertions to the provided `tests` callback.
 *
 * @param cypressVariant - The Cypress variant directory name used to locate the e2e project.
 * @param tests - Callback that receives a `GetLogs` helper and registers all assertions.
 * @param options - Additional run options, such as an optional `specsFolder`.
 */
const runVariantTests = (
  cypressVariant: string,
  tests: (getLogs: GetLogs) => void,
  options: Pick<RunSpecsTestsOptions, "specsFolder" | "config" | "hooks"> = {},
): void => {
  describe(`Executed in "${cypressVariant}". Specs folder "${options.specsFolder}"`, () => {
    let logs: string[];
    const getLogs: GetLogs = (specIndex) => logs[specIndex];

    beforeAll(async () => {
      logs = splitLogsBySpec(
        await pnpmRun(["cypress:run"], cypressVariant, {
          SPECS_FOLDER: options.specsFolder,
          CONFIG_IGNORE_PER_TEST_CONFIG:
            options.config?.failFastIgnorePerTestConfig === undefined
              ? undefined
              : String(options.config.failFastIgnorePerTestConfig),
          CONFIG_ENABLED:
            options.config?.failFastEnabled === undefined
              ? undefined
              : String(options.config.failFastEnabled),
          CONFIG_STRATEGY:
            options.config?.failFastStrategy === undefined
              ? undefined
              : String(options.config.failFastStrategy),
          CONFIG_BAIL:
            options.config?.failFastBail === undefined
              ? undefined
              : String(options.config.failFastBail),
          ENABLE_ON_FAIL_FAST_TRIGGERED_HOOK: options.hooks
            ?.enableOnFailFastTriggered
            ? String(options.hooks.enableOnFailFastTriggered)
            : undefined,
          ENABLE_SHOULD_TRIGGER_FAIL_FAST_HOOK: options.hooks
            ?.enableShouldTriggerFailFast
            ? String(options.hooks.enableShouldTriggerFailFast)
            : undefined,
          ENABLE_SKIP_MODE_AFTER_TESTS: options.hooks?.enableSkipModeAfterTests
            ? String(options.hooks.enableSkipModeAfterTests)
            : undefined,
        }),
      );
    }, 120000);

    tests(getLogs);
  });
};

/**
 * Top-level helper that wraps a complete spec-test suite in a labelled `describe`
 * block and runs all variants and per-spec assertions defined in `options`.
 *
 * @param description - Label for the outer `describe` block.
 * @param options - Configuration: the Cypress variant, per-spec expected results,
 *   and an optional specs folder override.
 */
// eslint-disable-next-line jest/no-export --- This function is meant to be imported and used in test files.
export function runSpecsTests(
  description: string,
  options: RunSpecsTestsOptions,
): void {
  const method = options.only ? describe.only : describe;
  method(`${description}`, () => {
    runVariantTests(
      options.cypressVariant,
      getSpecsStatusesTests(options.specsResults, options.hooks),
      options,
    );
  });
}
