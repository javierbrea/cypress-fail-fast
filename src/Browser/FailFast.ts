import type * as Cypress from "cypress";
import type * as Mocha from "mocha";

import {
  SHOULD_SKIP_TASK,
  FAILED_TESTS_TASK,
  RESET_SKIP_TASK,
  RESET_FAILED_TESTS_TASK,
  LOG_TASK,
  SKIP_MESSAGE,
  FAILED_TEST_MESSAGE,
} from "../Shared/Constants";

import {
  bailConfig,
  pluginIsEnabled,
  currentStrategyIsSpec,
} from "../Shared/Config";

import { failFastIsEnabled, testHasFailed, isHeaded } from "./CypressHelpers";

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
   * @returns Cypress chainable resolving to skip state.
   */
  function shouldSkip() {
    return cy.task<boolean>(SHOULD_SKIP_TASK, null, { log: false });
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
   * @returns Cypress chainable resolving when skip mode is enabled.
   */
  function enableSkipMode() {
    log(SKIP_MESSAGE);
    return cy.task<void>(SHOULD_SKIP_TASK, true);
  }

  /**
   * Increments the failed-tests counter.
   * @returns Cypress chainable resolving to total failed tests.
   */
  function registerFailure() {
    return cy.task<number>(FAILED_TESTS_TASK, true, { log: false });
  }

  /**
   * Runs a callback once the configured bail threshold is reached.
   * @param callback Callback executed when failed tests reach bail limit.
   */
  function registerFailureAndRunIfBailLimitIsReached(callback: () => void) {
    registerFailure().then((value) => {
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
   */
  function runIfSkipIsEnabled(callback: () => void) {
    shouldSkip().then((value) => {
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
    if (pluginIsEnabled(Cyp)) {
      runIfSkipIsEnabled(() => {
        context.skip();
      });
    }
  }

  before(function () {
    if (pluginIsEnabled(Cyp)) {
      if (isHeaded(Cyp) || currentStrategyIsSpec(Cyp)) {
        /*
          Reset the shouldSkip flag at the start of a run, so that it doesn't carry over into subsequent runs. Do this only for headed runs because in headless runs, the `before` hook is executed for each spec file.
        */
        resetSkipFlag();
        resetFailedTests();
      } else {
        skipSuiteIfEnabled(this);
      }
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
      pluginIsEnabled(Cyp) &&
      testHasFailed(currentTest) &&
      failFastIsEnabled(currentTest, Cyp)
    ) {
      log(`Test "${currentTest.fullTitle()}" has failed`);
      registerFailureAndRunIfBailLimitIsReached(() => {
        enableSkipMode();
      });
    }
  });
}
