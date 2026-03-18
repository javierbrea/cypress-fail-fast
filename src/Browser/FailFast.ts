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

export function registerFailFast(
  Cyp: Cypress.Cypress,
  cy: Cypress.cy,
  before: Mocha.HookFunction,
  beforeEach: Mocha.HookFunction,
  afterEach: Mocha.HookFunction,
) {
  function log(message: string) {
    cy.task<void>(LOG_TASK, message);
  }

  function shouldSkip() {
    return cy.task<boolean>(SHOULD_SKIP_TASK, null, { log: false });
  }

  function resetSkipFlag() {
    cy.task<void>(RESET_SKIP_TASK, null, { log: false });
  }

  function resetFailedTests() {
    cy.task<void>(RESET_FAILED_TESTS_TASK, null, { log: false });
  }

  function enableSkipMode() {
    log(SKIP_MESSAGE);
    return cy.task<void>(SHOULD_SKIP_TASK, true);
  }

  function registerFailure() {
    return cy.task<number>(FAILED_TESTS_TASK, true, { log: false });
  }

  function registerFailureAndRunIfBailLimitIsReached(callback: () => void) {
    registerFailure().then((value) => {
      const bail = bailConfig(Cyp);
      log(`${FAILED_TEST_MESSAGE}: ${value}/${bail}`);
      if (value >= bail) {
        callback();
      }
    });
  }

  function runIfSkipIsEnabled(callback: () => void) {
    shouldSkip().then((value) => {
      if (value === true) {
        callback();
      }
    });
  }

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
