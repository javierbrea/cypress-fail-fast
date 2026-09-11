import type * as Cypress from "cypress";
import type * as Mocha from "mocha";

import {
  SHOULD_SKIP_TASK,
  TRIGGER_FAIL_FAST_TASK,
  FAILED_TESTS_TASK,
  RESET_SKIP_TASK,
  RESET_FAILED_TESTS_TASK,
  LOG_TASK,
  SKIP_MESSAGE,
  FAILED_TEST_MESSAGE,
} from "../Shared/Constants";
import type {
  FailedTestsTaskPayload,
  FailFastFailedTestData,
  ShouldSkipTaskPayload,
  TriggerFailFastTaskPayload,
} from "../Node/Tasks.types";

import {
  bailConfig,
  currentStrategyIsSpec,
  currentStrategyIsDescribe,
} from "../Shared/Config";

import {
  failFastIsEnabled,
  testHasFailed,
  isHeaded,
  getSkipScopeTitlePath,
} from "./CypressHelpers";

/**
 * Registers Mocha hooks that implement fail-fast behavior in the browser process.
 * @param Cyp Cypress global object.
 * @param cy Cypress command API.
 * @param before Global `before` hook.
 * @param beforeEach Global `beforeEach` hook.
 * @param afterEach Global `afterEach` hook.
 */
export function registerFailFast(
  Cyp: Cypress.Cypress,
  cy: Cypress.cy,
  before: Mocha.HookFunction,
  beforeEach: Mocha.HookFunction,
  afterEach: Mocha.HookFunction,
) {
  /**
   * Logs a message through the Node-side logging task.
   * @param message Message to log.
   */
  function log(message: string) {
    cy.task<void>(LOG_TASK, message);
  }

  /**
   * Reads the global skip flag from Node tasks.
   *
   * The title path of the test about to run is sent along so that the
   * `describe` strategy can decide whether the test belongs to the describe
   * block where fail-fast was triggered. Other strategies ignore it.
   * @param currentTest Test about to run, when available.
   * @returns Cypress chainable resolving to skip state.
   */
  function shouldSkip(currentTest?: Mocha.Test) {
    const payload: ShouldSkipTaskPayload = {
      titlePath: currentTest?.titlePath(),
    };
    return cy.task<boolean>(SHOULD_SKIP_TASK, payload, { log: false });
  }

  /**
   * Resets the global skip flag.
   */
  function resetSkipFlag() {
    cy.task<void>(RESET_SKIP_TASK, null, { log: false });
  }

  /**
   * Resets the global failed-tests counter.
   */
  function resetFailedTests() {
    cy.task<void>(RESET_FAILED_TESTS_TASK, null, { log: false });
  }

  /**
   * Enables skip mode for subsequent tests.
   *
   * With the `describe` strategy, the skip mode is scoped to the describe
   * block of the test that triggered it, so only the remaining tests of that
   * block are skipped. The scope has to be resolved here, in the browser,
   * because the Mocha suite tree is not available in the Node process.
   * @param failedTest Failed test data shared with Node-side hooks.
   * @param skipScopeTitlePath Title path of the describe block to scope skip mode to.
   * @returns Cypress chainable resolving when skip mode is enabled.
   */
  function enableSkipMode(
    failedTest: FailFastFailedTestData,
    skipScopeTitlePath?: string[],
  ) {
    log(SKIP_MESSAGE);
    const payload: TriggerFailFastTaskPayload = {
      test: failedTest,
      skipScopeTitlePath,
    };
    return cy.task<void>(TRIGGER_FAIL_FAST_TASK, payload);
  }

  function mapFailedTest(currentTest: Mocha.Test): FailFastFailedTestData {
    return {
      name: currentTest.title,
      fullTitle: currentTest.fullTitle(),
    };
  }

  /**
   * Increments the failed-tests counter of the skip scope the failure belongs to.
   * @param skipScopeTitlePath Title path of the describe block to count the failure for.
   * @returns Cypress chainable resolving to total failed tests in that scope.
   */
  function registerFailure(skipScopeTitlePath?: string[]) {
    const payload: FailedTestsTaskPayload = {
      skipScopeTitlePath,
    };
    return cy.task<number>(FAILED_TESTS_TASK, payload, { log: false });
  }

  /**
   * Runs a callback once the configured bail threshold is reached in a scope.
   * @param skipScopeTitlePath Title path of the describe block to count the failure for.
   * @param callback Callback executed when failed tests reach bail limit.
   */
  function registerFailureAndRunIfBailLimitIsReached(
    skipScopeTitlePath: string[] | undefined,
    callback: () => void,
  ) {
    registerFailure(skipScopeTitlePath).then((value) => {
      const bail = bailConfig(Cyp);
      log(`${FAILED_TEST_MESSAGE}: ${value}/${bail}`);
      if (value >= bail) {
        callback();
      }
    });
  }

  /**
   * Runs a callback only when skip mode is active.
   * @param callback Callback to execute in skip mode.
   * @param currentTest Test about to run, used to evaluate scoped skip mode.
   */
  function runIfSkipIsEnabled(callback: () => void, currentTest?: Mocha.Test) {
    shouldSkip(currentTest).then((value) => {
      if (value === true) {
        callback();
      }
    });
  }

  /**
   * Skips the current suite when plugin and skip mode are both enabled.
   * @param context Mocha execution context.
   */
  function skipSuiteIfEnabled(context: Mocha.Context) {
    runIfSkipIsEnabled(() => {
      context.skip();
    }, context.currentTest);
  }

  before(function () {
    if (
      isHeaded(Cyp) ||
      currentStrategyIsSpec(Cyp) ||
      currentStrategyIsDescribe(Cyp)
    ) {
      /*
        Reset the shouldSkip flag at the start of a run, so that it doesn't carry over into subsequent runs. Do this only for headed runs because in headless runs, the `before` hook is executed for each spec file. The `describe` strategy resets here for the same reason the `spec` strategy does: a describe block only exists within one spec file, so its skip scope must never leak into the next one.
      */
      resetSkipFlag();
      resetFailedTests();
    } else {
      skipSuiteIfEnabled(this);
    }
  });

  beforeEach(function () {
    skipSuiteIfEnabled(this);
  });

  afterEach(function () {
    // Mark skip flag as true if test failed
    const currentTest = this.currentTest;
    if (
      currentTest &&
      testHasFailed(currentTest) &&
      failFastIsEnabled(currentTest, Cyp)
    ) {
      log(`Test "${currentTest.fullTitle()}" has failed`);
      /*
        The skip scope is only resolved (and sent) for the `describe` strategy:
        for `spec` and `run` an unscoped skip mode preserves the previous
        behavior of skipping every remaining test. It is also what the failure
        is counted against, so that the bail limit applies to each describe
        block independently.
      */
      const skipScopeTitlePath = currentStrategyIsDescribe(Cyp)
        ? getSkipScopeTitlePath(currentTest)
        : undefined;
      registerFailureAndRunIfBailLimitIsReached(skipScopeTitlePath, () => {
        enableSkipMode(mapFailedTest(currentTest), skipScopeTitlePath);
      });
    }
  });
}
