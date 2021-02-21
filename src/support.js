const {
  ENVIRONMENT_DEFAULT_VALUES,
  PLUGIN_ENVIRONMENT_VAR,
  ENABLED_ENVIRONMENT_VAR,
  SHOULD_SKIP_TASK,
  RESET_SKIP_TASK,
  isFalsy,
  isTruthy,
} = require("./helpers");

function support(Cypress, cy, beforeEach, afterEach, before) {
  let shouldSkip;
  function isHeaded() {
    return Cypress.browser && Cypress.browser.isHeaded;
  }

  function booleanEnvironmentVarValue(environmentVarName) {
    const defaultValue = ENVIRONMENT_DEFAULT_VALUES[environmentVarName];
    const value = Cypress.env(environmentVarName);
    const isTruthyValue = isTruthy(value);
    if (!isTruthyValue && !isFalsy(value)) {
      return defaultValue;
    }
    return isTruthyValue;
  }

  function getFailFastEnvironmentConfig() {
    return {
      plugin: booleanEnvironmentVarValue(PLUGIN_ENVIRONMENT_VAR),
      enabled: booleanEnvironmentVarValue(ENABLED_ENVIRONMENT_VAR),
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
    return getFailFastEnvironmentConfig().plugin;
  }

  function shouldSkipRestOfTests(currentTest) {
    return getTestFailFastConfig(currentTest).enabled;
  }

  function testHasFailed(currentTest) {
    return currentTest.state === "failed" && currentTest.currentRetry() === currentTest.retries();
  }

  beforeEach(function () {
    if (pluginIsEnabled()) {
      if (shouldSkip) {
        Cypress.runner.stop();
      } else {
        cy.task(SHOULD_SKIP_TASK, null, { log: false }).then((value) => {
          if (value === true) {
            shouldSkip = true;
            Cypress.runner.stop();
          }
        });
      }
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
      shouldSkip = true;
      cy.task(SHOULD_SKIP_TASK, true);
    }
  });

  before(function () {
    if (pluginIsEnabled()) {
      if (isHeaded()) {
        /*
          Reset the shouldSkip flag at the start of a run, so that it
          doesn't carry over into subsequent runs.
          Do this only for headed runs because in headless runs,
          the `before` hook is executed for each spec file.
        */
        shouldSkip = false;
        cy.task(RESET_SKIP_TASK, null, { log: false });
      } else {
        cy.task(SHOULD_SKIP_TASK, null, { log: false }).then((value) => {
          if (value === true) {
            shouldSkip = true;
            Cypress.runner.stop();
          }
        });
      }
    }
  });
}

module.exports = support;
