const {
  SHOULD_SKIP_TASK,
  RESET_SKIP_TASK,
  FAILED_TESTS_TASK,
  RESET_FAILED_TESTS_TASK,
  LOG_TASK,
  STOP_MESSAGE,
  SKIP_MESSAGE,
  FAILED_TEST_MESSAGE,
} = require("./helpers/constants");

const {
  bailConfig,
  pluginIsEnabled,
  failFastIsEnabled,
  currentStrategyIsSpec,
} = require("./helpers/config");

const { isHeaded, testHasFailed, wrapCypressRunner, stopRunner } = require("./helpers/cypress");

function support(Cypress, cy, beforeEach, afterEach, before) {
  function stopCypressRunner() {
    cy.task(LOG_TASK, STOP_MESSAGE);
    stopRunner(Cypress);
  }

  function resetSkipFlag() {
    cy.task(RESET_SKIP_TASK, null, { log: false });
  }

  function resetFailedTests() {
    cy.task(RESET_FAILED_TESTS_TASK, null, { log: false });
  }

  function enableSkipMode() {
    cy.task(LOG_TASK, SKIP_MESSAGE);
    cy.task(SHOULD_SKIP_TASK, true);
  }

  function registerFailureAndRunIfBailLimitIsReached(callback) {
    cy.task(FAILED_TESTS_TASK, true, { log: false }).then((value) => {
      const bail = bailConfig(Cypress);
      cy.task(LOG_TASK, `${FAILED_TEST_MESSAGE}: ${value}/${bail}`);
      if (value >= bail) {
        callback();
      }
    });
  }

  function runIfSkipIsEnabled(callback) {
    cy.task(SHOULD_SKIP_TASK, null, { log: false }).then((value) => {
      if (value === true) {
        callback();
      }
    });
  }

  beforeEach(function () {
    if (pluginIsEnabled(Cypress)) {
      runIfSkipIsEnabled(() => {
        this.currentTest.pending = true;
        stopCypressRunner();
      });
    }
  });

  afterEach(function () {
    // Mark skip flag as true if test failed
    const currentTest = this.currentTest;
    if (
      currentTest &&
      pluginIsEnabled(Cypress) &&
      testHasFailed(currentTest) &&
      failFastIsEnabled(currentTest, Cypress)
    ) {
      registerFailureAndRunIfBailLimitIsReached(() => {
        enableSkipMode();
      });
    }
  });

  before(function () {
    if (pluginIsEnabled(Cypress)) {
      if (isHeaded(Cypress) || currentStrategyIsSpec(Cypress)) {
        /*
          Reset the shouldSkip flag at the start of a run, so that it doesn't carry over into subsequent runs. Do this only for headed runs because in headless runs, the `before` hook is executed for each spec file.
        */
        resetSkipFlag();
        resetFailedTests();
      } else {
        runIfSkipIsEnabled(() => {
          stopCypressRunner();
        });
      }
    }
  });

  if (pluginIsEnabled(Cypress)) {
    wrapCypressRunner(Cypress);
  }
}

module.exports = support;
