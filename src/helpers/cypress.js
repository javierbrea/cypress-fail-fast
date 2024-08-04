function isHeaded(Cypress) {
  return Cypress.browser && Cypress.browser.isHeaded;
}

function testHasFailed(currentTest) {
  return currentTest.state === "failed" && currentTest.currentRetry() === currentTest.retries();
}

function setGlobalForceFailError(error) {
  // eslint-disable-next-line no-undef
  window.hookFailedError = error;
}

function getGlobalForceFailError() {
  // eslint-disable-next-line no-undef
  return window.hookFailedError;
}

function wrapCypressRunner(Cypress) {
  let hookFailed, hookFailedName, hookError;
  const _onRunnableRun = Cypress.runner.onRunnableRun;
  Cypress.runner.onRunnableRun = function (runnableRun, runnable, args) {
    const isHook = runnable.type === "hook";
    const isBeforeHook = isHook && /before/.test(runnable.hookName);

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
      return next.call(this /*, error*/);
    };

    const forceTestToFail = function () {
      hookFailed = false;
      hookError.message = `"${hookFailedName}" hook failed: ${hookError.message}`;

      // NOTE: In Cypress 13, passing the error does not produce the test to fail, so, we also set a global variable to force the afterEach hook to fail after the test
      setGlobalForceFailError(hookError);
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

function getTestConfig(test) {
  // Cypress <6.7
  if (test.cfg) {
    return test.cfg;
  }
  // Cypress >9
  if (
    test.ctx &&
    test.ctx.test &&
    test.ctx.test._testConfig &&
    test.ctx.test._testConfig.testConfigList &&
    test.ctx.test._testConfig.testConfigList[
      test.ctx.test._testConfig.testConfigList.length - 1
    ] &&
    test.ctx.test._testConfig.testConfigList[test.ctx.test._testConfig.testConfigList.length - 1]
      .overrides
  ) {
    return test.ctx.test._testConfig.testConfigList[
      test.ctx.test._testConfig.testConfigList.length - 1
    ].overrides;
  }
  // Cypress >6.7
  if (test.ctx && test.ctx.test && test.ctx.test._testConfig) {
    return test.ctx.test._testConfig;
  }
  return {};
}

function stopRunner(Cypress) {
  Cypress.runner.stop();
}

module.exports = {
  isHeaded,
  testHasFailed,
  wrapCypressRunner,
  getTestConfig,
  stopRunner,
  setGlobalForceFailError,
  getGlobalForceFailError,
};
