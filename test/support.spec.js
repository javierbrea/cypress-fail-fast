const sinon = require("sinon");
const support = require("../src/support");

const wait = (time) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

describe("support", () => {
  let sandbox;
  let beforeEachCallback;
  let afterEachCallback;
  let beforeCallback;
  let getCurrentTest;
  let Cypress;
  let CypressOnRunnableRun;
  let cy;

  const getSupportCallbacks = (options = {}) => {
    sandbox = sinon.createSandbox();
    CypressOnRunnableRun = sandbox.spy();
    Cypress = {
      browser: {
        isHeaded: options.browserIsHeaded,
      },
      env: (envKey) => {
        if (envKey === "FAIL_FAST_PLUGIN") {
          return options.pluginEnabled;
        }
        if (envKey === "FAIL_FAST_ENABLED") {
          return options.enabled;
        }
        if (envKey === "FAIL_FAST_STRATEGY") {
          return options.strategy;
        }
      },
      runner: {
        stop: sandbox.spy(),
        onRunnableRun: CypressOnRunnableRun,
      },
    };
    if (options.removeCypressBrowser) {
      delete Cypress.browser;
    }
    cy = {
      task: sandbox.spy(() => {
        return Promise.resolve(options.shouldSkip);
      }),
    };
    const currentTest = options.disableCurrentTest
      ? {}
      : {
          currentTest: {
            state: options.testState,
            currentRetry: () => options.testCurrentRetry,
            retries: () => options.testRetries,
            // Private property storing test config in Cypress <6.6
            cfg: options.customConfig,
            parent: options.testParent,
          },
        };

    // Private property storing test config in Cypress >6.6
    if (currentTest.currentTest && options.customConfigCtx) {
      currentTest.currentTest.ctx = {
        test: {
          _testConfig: options.customConfigCtx,
        },
      };
    }

    getCurrentTest = () => currentTest;

    const beforeEachMethod = (callback) => {
      beforeEachCallback = callback.bind(currentTest);
    };
    const afterEachMethod = (callback) => {
      afterEachCallback = callback.bind(currentTest);
    };
    const beforeMethod = (callback) => {
      beforeCallback = callback.bind(currentTest);
    };
    support(Cypress, cy, beforeEachMethod, afterEachMethod, beforeMethod);
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  const testPluginDisabled = (extraDescription, config) => {
    describe(`when plugin is disabled ${extraDescription}`, () => {
      describe("beforeEach callback", () => {
        it("should not call to any plugin task", () => {
          getSupportCallbacks(config);
          beforeEachCallback();
          expect(cy.task.callCount).toEqual(0);
        });
      });

      describe("afterEach callback", () => {
        it("should not call to any plugin task when test fails", () => {
          getSupportCallbacks({
            ...config,
            testState: "failed",
            testCurrentRetry: 3,
            testRetries: 3,
          });
          afterEachCallback();
          expect(cy.task.callCount).toEqual(0);
        });

        it("should not call to stop runner nor set plugin flag if current test config is enabled", () => {
          getSupportCallbacks({
            ...config,
            testState: "failed",
            testCurrentRetry: 3,
            testRetries: 3,
            customConfig: {
              failFast: {
                enabled: true,
              },
            },
          });
          afterEachCallback();
          expect(Cypress.runner.stop.callCount).toEqual(0);
          expect(cy.task.callCount).toEqual(0);
        });
      });

      describe("before callback", () => {
        it("should not call to any plugin task", () => {
          getSupportCallbacks(config);
          beforeCallback();
          expect(cy.task.callCount).toEqual(0);
        });
      });

      describe("Cypress onRunnableRun method", () => {
        it("should not be wrapped", () => {
          getSupportCallbacks(config);
          expect(Cypress.runner.onRunnableRun).toBe(CypressOnRunnableRun);
        });
      });
    });
  };

  const testPluginAndFailFastEnabled = (extraDescription, config) => {
    describe(`when plugin and failFast are enabled ${extraDescription}`, () => {
      describe("beforeEach callback", () => {
        it("should call stop runner if failFastShouldSkip returns true", async () => {
          getSupportCallbacks({
            ...config,
            shouldSkip: true,
          });
          beforeEachCallback();
          await wait(200);
          expect(Cypress.runner.stop.callCount).toEqual(1);
        });

        it("should set currentTest as pending if failFastShouldSkip returns true", async () => {
          getSupportCallbacks({
            ...config,
            shouldSkip: true,
          });
          beforeEachCallback();
          await wait(200);
          expect(getCurrentTest().currentTest.pending).toEqual(true);
        });

        it("should not log the task when setting flag to true", async () => {
          getSupportCallbacks({
            ...config,
            shouldSkip: true,
          });
          beforeEachCallback();
          await wait(200);
          expect(cy.task.calledWith("failFastShouldSkip", null, { log: false })).toEqual(true);
        });

        it("should not call stop runner if failFastShouldSkip returns false", async () => {
          getSupportCallbacks({
            ...config,
            shouldSkip: false,
          });
          beforeEachCallback();
          await wait(200);
          expect(Cypress.runner.stop.callCount).toEqual(0);
        });
      });

      describe("afterEach callback", () => {
        it("should set plugin flag and do not stop runner if current test state is failed and it is last retry", async () => {
          getSupportCallbacks({
            ...config,
            shouldSkip: true,
            testState: "failed",
            testCurrentRetry: 3,
            testRetries: 3,
          });
          afterEachCallback();
          await wait(200);
          expect(Cypress.runner.stop.callCount).toEqual(0);
          expect(cy.task.calledWith("failFastShouldSkip", true)).toEqual(true);
        });

        it("should not set plugin flag if current test state is not failed", async () => {
          getSupportCallbacks({
            ...config,
            shouldSkip: true,
            testState: "passed",
            testCurrentRetry: 3,
            testRetries: 3,
          });
          afterEachCallback();
          await wait(200);
          expect(cy.task.callCount).toEqual(0);
        });

        it("should not set plugin flag if current test retry is not the last one", async () => {
          getSupportCallbacks({
            ...config,
            shouldSkip: true,
            testState: "failed",
            testCurrentRetry: 3,
            testRetries: 4,
          });
          afterEachCallback();
          await wait(200);
          expect(cy.task.callCount).toEqual(0);
        });

        it("should not set plugin flag if test.currentTest is not found", async () => {
          getSupportCallbacks({
            ...config,
            shouldSkip: true,
            disableCurrentTest: true,
          });
          afterEachCallback();
          await wait(200);
          expect(cy.task.callCount).toEqual(0);
        });
      });

      describe("before callback", () => {
        it("should not call to reset plugin if browser is not headed", async () => {
          getSupportCallbacks({
            ...config,
            browserIsHeaded: false,
          });
          beforeCallback();
          await wait(200);
          expect(cy.task.calledWith("failFastResetSkip")).toEqual(false);
        });

        it("should not call to reset plugin if Cypress browser does not exists", async () => {
          getSupportCallbacks({
            ...config,
            removeCypressBrowser: true,
          });
          beforeCallback();
          await wait(200);
          expect(cy.task.calledWith("failFastResetSkip")).toEqual(false);
        });

        it("should call to reset plugin if browser is headed", async () => {
          getSupportCallbacks({
            ...config,
            browserIsHeaded: true,
          });
          beforeCallback();
          await wait(200);
          expect(cy.task.calledWith("failFastResetSkip")).toEqual(true);
        });

        it("should call to reset plugin if strategy is spec", async () => {
          getSupportCallbacks({
            ...config,
            strategy: "spec",
          });
          beforeCallback();
          await wait(200);
          expect(cy.task.calledWith("failFastResetSkip")).toEqual(true);
        });

        it("should not log the task when resetting the plugin flag", async () => {
          getSupportCallbacks({
            ...config,
            browserIsHeaded: true,
          });
          beforeCallback();
          await wait(200);
          expect(cy.task.getCall(0).args[1]).toEqual(null);
          expect(cy.task.getCall(0).args[2]).toEqual({ log: false });
        });

        it("should call to stop runner if browser is not headed and should skip", async () => {
          getSupportCallbacks({
            ...config,
            browserIsHeaded: false,
            shouldSkip: true,
          });
          beforeCallback();
          await wait(200);
          expect(Cypress.runner.stop.callCount).toEqual(1);
        });

        it("should not log the task when checking if has to skip", async () => {
          getSupportCallbacks({
            ...config,
            browserIsHeaded: false,
            shouldSkip: true,
          });
          beforeCallback();
          await wait(200);
          expect(cy.task.getCall(0).args[1]).toEqual(null);
          expect(cy.task.getCall(0).args[2]).toEqual({ log: false });
        });

        it("should not call to stop runner if browser is not headed and should not skip", async () => {
          getSupportCallbacks({
            ...config,
            browserIsHeaded: false,
            shouldSkip: false,
          });
          beforeCallback();
          await wait(200);
          expect(Cypress.runner.stop.callCount).toEqual(0);
        });
      });

      describe("Cypress onRunnableRun method", () => {
        let runnableRun, runnable, args, firstArg;
        beforeEach(() => {
          firstArg = sandbox.spy();
          runnableRun = sandbox.spy();
          runnable = {};
          args = [firstArg];
        });

        it("should be wrapped", () => {
          getSupportCallbacks(config);
          expect(Cypress.runner.onRunnableRun).not.toBe(CypressOnRunnableRun);
        });

        it("should be called with original arguments if runnable is not a hook", () => {
          getSupportCallbacks(config);
          Cypress.runner.onRunnableRun(runnableRun, runnable, args);
          expect(CypressOnRunnableRun.getCall(0).args).toEqual([runnableRun, runnable, args]);
          expect(CypressOnRunnableRun.getCall(0).args[2][0]).toBe(firstArg);
        });

        it("should be called with a wrapped first arg if runnable is a before hook", () => {
          getSupportCallbacks(config);
          runnable.type = "hook";
          runnable.hookName = "before";
          Cypress.runner.onRunnableRun(runnableRun, runnable, args);
          expect(CypressOnRunnableRun.getCall(0).args[2][0]).not.toBe(firstArg);
        });

        it("should be called with a wrapped first arg if runnable is a beforeEach hook", () => {
          getSupportCallbacks(config);
          runnable.type = "hook";
          runnable.hookName = "beforeEach";
          Cypress.runner.onRunnableRun(runnableRun, runnable, args);
          expect(CypressOnRunnableRun.getCall(0).args[2][0]).not.toBe(firstArg);
        });

        it("should call to original first arg", () => {
          getSupportCallbacks(config);
          runnable.type = "hook";
          runnable.hookName = "beforeEach";
          Cypress.runner.onRunnableRun(runnableRun, runnable, args);
          CypressOnRunnableRun.getCall(0).args[2][0]();
          expect(firstArg.callCount).toEqual(1);
        });

        it("should call to original first arg without error even when it is received", () => {
          getSupportCallbacks(config);
          runnable.type = "hook";
          runnable.hookName = "beforeEach";
          Cypress.runner.onRunnableRun(runnableRun, runnable, args);
          CypressOnRunnableRun.getCall(0).args[2][0](new Error());
          expect(firstArg.getCall(0).args[1]).toBe(undefined);
        });

        it("next before hook after the hook should be skipped", async () => {
          getSupportCallbacks(config);
          const hookError = new Error("foo error message");
          runnable.type = "hook";
          runnable.hookName = "beforeEach";
          Cypress.runner.onRunnableRun(runnableRun, runnable, args);
          CypressOnRunnableRun.getCall(0).args[2][0](hookError);
          runnable = {
            type: "hook",
            hookName: "beforeEach",
          };

          const testCallbackSpy = () => "foo";
          expect(Cypress.runner.onRunnableRun(runnableRun, runnable, [testCallbackSpy])).toEqual(
            "foo"
          );
        });

        it("next test after the hook should be forced to fail with the hook error", async () => {
          getSupportCallbacks(config);
          const hookError = new Error("foo error message");
          runnable.type = "hook";
          runnable.hookName = "beforeEach";
          Cypress.runner.onRunnableRun(runnableRun, runnable, args);
          CypressOnRunnableRun.getCall(0).args[2][0](hookError);
          runnable = {
            type: "it",
          };

          const testCallbackSpy = sandbox.spy();
          Cypress.runner.onRunnableRun(runnableRun, runnable, [testCallbackSpy]);
          CypressOnRunnableRun.getCall(1).args[2][0]();
          const testCallBackArgument = testCallbackSpy.getCall(0).args[0];
          expect(testCallBackArgument).toBe(hookError);
          expect(testCallBackArgument.message).toEqual(
            '"beforeEach" hook failed: foo error message'
          );
        });
      });
    });
  };

  const testAfterEachWithPluginEnabledAndConfigEnabled = (extraDescription, config) => {
    describe(`afterEach callback when plugin is enabled and config is enabled ${extraDescription}`, () => {
      it("should set plugin flag", async () => {
        getSupportCallbacks({
          ...config,
          testState: "failed",
          testCurrentRetry: 3,
          testRetries: 3,
        });
        afterEachCallback();
        await wait(200);
        expect(cy.task.calledWith("failFastShouldSkip", true)).toEqual(true);
      });
    });
  };

  const testAfterEachWithPluginEnabledAndConfigDisabled = (extraDescription, config) => {
    describe(`afterEach callback when plugin is enabled and config is disabled ${extraDescription}`, () => {
      it("should not set plugin flag", async () => {
        getSupportCallbacks({
          ...config,
          testState: "failed",
          testCurrentRetry: 3,
          testRetries: 3,
        });
        afterEachCallback();
        await wait(200);
        expect(cy.task.callCount).toEqual(0);
      });
    });
  };

  testPluginDisabled("with false as string", {
    enabled: true,
    pluginEnabled: "false",
  });

  testPluginDisabled("with false as boolean", {
    enabled: true,
    pluginEnabled: false,
  });

  testPluginDisabled("with 0", {
    enabled: true,
    pluginEnabled: 0,
  });

  testPluginDisabled("with 0 string", {
    enabled: true,
    pluginEnabled: "0",
  });

  testPluginAndFailFastEnabled("by default", {});

  testPluginAndFailFastEnabled("using environment vars", {
    enabled: true,
    pluginEnabled: true,
  });

  testPluginAndFailFastEnabled("using environment vars as strings", {
    enabled: "true",
    pluginEnabled: "true",
  });

  testPluginAndFailFastEnabled("using environment vars as numbers", {
    enabled: 1,
    pluginEnabled: 1,
  });

  testAfterEachWithPluginEnabledAndConfigEnabled("by default", {});

  testAfterEachWithPluginEnabledAndConfigEnabled("in environment variable as boolean", {
    enabled: true,
  });

  testAfterEachWithPluginEnabledAndConfigEnabled("in environment variable as string", {
    enabled: "true",
  });

  testAfterEachWithPluginEnabledAndConfigEnabled("in environment variable as number", {
    enabled: 1,
  });

  testAfterEachWithPluginEnabledAndConfigEnabled("in environment variable as number string", {
    enabled: "1",
  });

  testAfterEachWithPluginEnabledAndConfigEnabled("in test but disabled in grandparent", {
    customConfig: {
      failFast: {
        enabled: true,
      },
    },
    testParent: {
      cfg: {
        failFast: {
          enabled: false,
        },
      },
    },
  });

  testAfterEachWithPluginEnabledAndConfigEnabled("in test but disabled in environment", {
    enabled: false,
    customConfig: {
      failFast: {
        enabled: true,
      },
    },
  });

  testAfterEachWithPluginEnabledAndConfigDisabled("in environment variable", {
    enabled: false,
  });

  testAfterEachWithPluginEnabledAndConfigDisabled("in environment variable as string", {
    enabled: "false",
  });

  testAfterEachWithPluginEnabledAndConfigDisabled("in environment variable as number", {
    enabled: 0,
  });

  testAfterEachWithPluginEnabledAndConfigDisabled("in environment variable as number string", {
    enabled: "0",
  });

  testAfterEachWithPluginEnabledAndConfigDisabled("in current test", {
    customConfig: {
      failFast: {
        enabled: false,
      },
    },
  });

  testAfterEachWithPluginEnabledAndConfigDisabled("in current test in Cypress >6.6", {
    customConfigCtx: {
      failFast: {
        enabled: false,
      },
    },
  });

  testAfterEachWithPluginEnabledAndConfigDisabled("in current test but enabled in environment", {
    enabled: true,
    customConfig: {
      failFast: {
        enabled: false,
      },
    },
  });

  testAfterEachWithPluginEnabledAndConfigDisabled("in parent test", {
    testParent: {
      cfg: {
        failFast: {
          enabled: false,
        },
      },
    },
  });

  testAfterEachWithPluginEnabledAndConfigDisabled("in parent test but enabled in environment", {
    enabled: true,
    testParent: {
      cfg: {
        failFast: {
          enabled: false,
        },
      },
    },
  });

  testAfterEachWithPluginEnabledAndConfigDisabled("in grandparent test", {
    testParent: {
      parent: {
        parent: {
          cfg: {
            failFast: {
              enabled: false,
            },
          },
        },
      },
    },
  });

  testAfterEachWithPluginEnabledAndConfigDisabled(
    "in grandparent test but enabled in environment",
    {
      enabled: true,
      testParent: {
        parent: {
          parent: {
            cfg: {
              failFast: {
                enabled: false,
              },
            },
          },
        },
      },
    }
  );
});
