const { PLUGIN_ENVIRONMENT_VAR, SHOULD_SKIP_TASK, RESET_SKIP_TASK } = require("./helpers");

function support(Cypress, cy, beforeEach, afterEach, before) {
  function isHeaded() {
    return Cypress.browser && Cypress.browser.isHeaded;
  }

  function getFailFastEnvironmentConfig() {
    return {
      enabled:
        Cypress.env(PLUGIN_ENVIRONMENT_VAR) === true ||
        Cypress.env(PLUGIN_ENVIRONMENT_VAR) === "true",
    };
  }

  function getTestFailFastConfig(currentTest) {
    if (currentTest.cfg && currentTest.cfg.failFast) {
      return currentTest.cfg.failFast;
    }
    if (currentTest.parent) {
      return getTestFailFastConfig(currentTest.parent);
    }
    return getFailFastEnvironmentConfig();
  }

  function pluginIsEnabled() {
    return getFailFastEnvironmentConfig().enabled;
  }

  function shouldSkipRestOfTests(currentTest) {
    return getTestFailFastConfig(currentTest).enabled;
  }

  function testHasFailed(currentTest) {
    return currentTest.state === "failed" && currentTest.currentRetry() === currentTest.retries();
  }

  beforeEach(function () {
    if (pluginIsEnabled()) {
      cy.task(SHOULD_SKIP_TASK, null, { log: false }).then((value) => {
        if (value === true) {
          Cypress.runner.stop();
        }
      });
    }
  });

  afterEach(function () {
    // Mark skip flag as true if test failed
    const currentTest = this.currentTest;
    if (
      currentTest &&
      pluginIsEnabled() &&
      testHasFailed(currentTest) &&
      shouldSkipRestOfTests(currentTest)
    ) {
      cy.task(SHOULD_SKIP_TASK, true);
      Cypress.runner.stop();
    }
  });

  before(function () {
    if (isHeaded() && pluginIsEnabled()) {
      /*
        Reset the shouldSkip flag at the start of a run, so that it
        doesn't carry over into subsequent runs.
        Do this only for headed runs because in headless runs,
        the `before` hook is executed for each spec file.
      */
      cy.task(RESET_SKIP_TASK, null, { log: false });
    }
  });
}

module.exports = support;
