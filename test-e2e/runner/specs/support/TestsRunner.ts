import { pnpmRun } from "./CommandRunner";
import { splitLogsBySpec } from "./Logs";

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
}

/** {@link SpecExpectedStatuses} with the resolved 1-based spec index attached. */
interface ResolvedSpecStatuses extends SpecExpectedStatuses {
  /** 1-based index of the spec file within the run. */
  spec: number;
}

/** Options accepted by {@link runSpecsTests}. */
interface RunSpecsTestsOptions {
  /** Name of the Cypress variant directory to run tests in. */
  cypressVariant: string;
  /** Subfolder inside the variant's `cypress/e2e` directory that contains the specs. */
  specsFolder?: string;
  /** One entry per spec file, describing the expected test-status counts. */
  specsResults: SpecExpectedStatuses[];
}

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
): ((getLogs: GetLogs) => void) => {
  return (getLogs: GetLogs): void => {
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
  options: Pick<RunSpecsTestsOptions, "specsFolder"> = {},
): void => {
  describe(`Executed in ${cypressVariant}`, () => {
    let logs: string[];
    const getLogs: GetLogs = (specIndex) => logs[specIndex];

    beforeAll(async () => {
      logs = splitLogsBySpec(
        await pnpmRun(["cypress:run"], cypressVariant, {
          SPECS_FOLDER: options.specsFolder,
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
  describe(`${description}`, () => {
    runVariantTests(
      options.cypressVariant,
      getSpecsStatusesTests(options.specsResults),
      options,
    );
  });
}
