const {
  ENVIRONMENT_DEFAULT_VALUES,
  PLUGIN_ENVIRONMENT_VAR,
  ENABLED_ENVIRONMENT_VAR,
  STRATEGY_ENVIRONMENT_VAR,
  SHOULD_SKIP_TASK,
  RESET_SKIP_TASK,
  LOG_TASK,
  STOP_MESSAGE,
  SKIP_MESSAGE,
  isFalsy,
  isTruthy,
  strategyIsSpec,
} = require("./helpers");

function support(Cypress, cy, beforeEach, afterEach, before) {
  let hookFailed, hookFailedName, hookError;

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
      strategyIsSpec: strategyIsSpec(Cypress.env(STRATEGY_ENVIRONMENT_VAR)),
    };
  }

  function getTestConfig(test) {
    // Cypress <6.7
    if (test.cfg) {
      return test.cfg;
    }
    // Cypress >6.7
    if (test.ctx && test.ctx.test && test.ctx.test._testConfig) {
      return test.ctx.test._testConfig;
    }
    return {};
  }

  function getTestFailFastConfig(currentTest) {
    const testConfig = getTestConfig(currentTest);
    if (testConfig.failFast) {
      return testConfig.failFast;
    }
    if (currentTest.parent) {
      return getTestFailFastConfig(currentTest.parent);
    }
    return getFailFastEnvironmentConfig();
  }

  function currentStrategyIsSpec() {
    return getFailFastEnvironmentConfig().strategyIsSpec;
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

  function stopCypressRunner() {
    cy.task(LOG_TASK, STOP_MESSAGE);
    Cypress.runner.stop();
  }

  function resetSkipFlag() {
    cy.task(RESET_SKIP_TASK, null, { log: false });
  }

  function enableSkipMode() {
    cy.task(LOG_TASK, SKIP_MESSAGE);
    cy.task(SHOULD_SKIP_TASK, true);
  }

  function runIfSkipIsEnabled(callback) {
    cy.task(SHOULD_SKIP_TASK, null, { log: false }).then((value) => {
      if (value === true) {
        callback();
      }
    });
  }

  beforeEach(function () {
    if (pluginIsEnabled()) {
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
      pluginIsEnabled() &&
      testHasFailed(currentTest) &&
      shouldSkipRestOfTests(currentTest)
    ) {
      enableSkipMode();
    }
  });

  before(function () {
    if (pluginIsEnabled()) {
      if (isHeaded() || currentStrategyIsSpec()) {
        /*
          Reset the shouldSkip flag at the start of a run, so that it
          doesn't carry over into subsequent runs.
          Do this only for headed runs because in headless runs,
          the `before` hook is executed for each spec file.
        */
        resetSkipFlag();
      } else {
        runIfSkipIsEnabled(() => {
          stopCypressRunner();
        });
      }
    }
  });

  const _onRunnableRun = Cypress.runner.onRunnableRun;

  if (pluginIsEnabled()) {
    Cypress.runner.onRunnableRun = function (runnableRun, runnable, args) {
      const isHook = runnable.type === "hook";
      const isBeforeHook = isHook && runnable.hookName.match(/before/);

      const next = args[0];

      const setFailedFlag = function (error) {
        if (error) {
          hookFailedName = runnable.hookName;
          hookError = error;
          hookFailed = true;
        }
        /* 
          Do not pass the error, because Cypress stops if there is an error on before hooks,
          so this plugin can't set the skip flag
        */
        return next.call(this /*, error */);
      };

      const forceTestToFail = function () {
        hookFailed = false;
        hookError.message = `"${hookFailedName}" hook failed: ${hookError.message}`;
        // Force next test to fail, so the plugin can set the skip flag, and the test is marked as failed
        return next.call(this, hookError);
      };

      if (isBeforeHook && hookFailed) {
        // Skip other before hooks when one failed
        return next();
      } else if (!isHook && hookFailed) {
        args[0] = forceTestToFail;
      } else if (isBeforeHook) {
        args[0] = setFailedFlag;
      }

      return _onRunnableRun.apply(this, [runnableRun, runnable, args]);
    };
  }
}

module.exports = support;
