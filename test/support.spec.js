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
  let Cypress;
  let cy;

  const getSupportCallbacks = (options = {}) => {
    sandbox = sinon.createSandbox();
    Cypress = {
      browser: {
        isHeaded: options.browserIsHeaded,
      },
      env: (envKey) => {
        if (envKey === "FAIL_FAST") {
          return options.pluginEnabled;
        }
      },
      runner: {
        stop: sandbox.spy(),
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
            cfg: options.customConfig,
            parent: options.testParent,
          },
        };
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

  describe("when plugin is disabled", () => {
    describe("beforeEach callback", () => {
      it("should not call to any plugin task", () => {
        getSupportCallbacks();
        beforeEachCallback();
        expect(cy.task.callCount).toEqual(0);
      });
    });

    describe("afterEach callback", () => {
      it("should not call to any plugin task", () => {
        getSupportCallbacks({
          testState: "failed",
          testCurrentRetry: 3,
          testRetries: 3,
        });
        afterEachCallback();
        expect(cy.task.callCount).toEqual(0);
      });

      it("should not call to stop runner nor set plugin flag if current test config is enabled", () => {
        getSupportCallbacks({
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
        getSupportCallbacks();
        beforeCallback();
        expect(cy.task.callCount).toEqual(0);
      });
    });
  });

  describe("when plugin is enabled", () => {
    describe("beforeEach callback", () => {
      it("should call stop runner if failFastShouldSkip returns true when enabled with string", async () => {
        getSupportCallbacks({
          pluginEnabled: "true",
          shouldSkip: true,
        });
        beforeEachCallback();
        await wait(200);
        expect(Cypress.runner.stop.callCount).toEqual(1);
      });

      it("should call stop runner if failFastShouldSkip returns true", async () => {
        getSupportCallbacks({
          pluginEnabled: true,
          shouldSkip: true,
        });
        beforeEachCallback();
        await wait(200);
        expect(Cypress.runner.stop.callCount).toEqual(1);
      });

      it("should not call stop runner if failFastShouldSkip returns false", async () => {
        getSupportCallbacks({
          pluginEnabled: true,
          shouldSkip: false,
        });
        beforeEachCallback();
        await wait(200);
        expect(Cypress.runner.stop.callCount).toEqual(0);
      });
    });

    describe("afterEach callback", () => {
      it("should call stop runner and set plugin flag if current test state is failed and it is last retry", async () => {
        getSupportCallbacks({
          pluginEnabled: true,
          shouldSkip: true,
          testState: "failed",
          testCurrentRetry: 3,
          testRetries: 3,
        });
        afterEachCallback();
        await wait(200);
        expect(Cypress.runner.stop.callCount).toEqual(1);
        expect(cy.task.calledWith("failFastShouldSkip", true)).toEqual(true);
      });

      it("should call stop runner and set plugin flag if current test state is failed and it is last retry when enabled with string", async () => {
        getSupportCallbacks({
          pluginEnabled: "true",
          shouldSkip: true,
          testState: "failed",
          testCurrentRetry: 3,
          testRetries: 3,
        });
        afterEachCallback();
        await wait(200);
        expect(Cypress.runner.stop.callCount).toEqual(1);
        expect(cy.task.calledWith("failFastShouldSkip", true)).toEqual(true);
      });

      it("should not call to stop runner nor set plugin flag if current test state is not failed", async () => {
        getSupportCallbacks({
          pluginEnabled: true,
          shouldSkip: true,
          testState: "passed",
          testCurrentRetry: 3,
          testRetries: 3,
        });
        afterEachCallback();
        await wait(200);
        expect(Cypress.runner.stop.callCount).toEqual(0);
        expect(cy.task.callCount).toEqual(0);
      });

      it("should not call to stop runner  and set plugin flag if current test retry is not the last one", async () => {
        getSupportCallbacks({
          pluginEnabled: true,
          shouldSkip: true,
          testState: "failed",
          testCurrentRetry: 3,
          testRetries: 4,
        });
        afterEachCallback();
        await wait(200);
        expect(Cypress.runner.stop.callCount).toEqual(0);
        expect(cy.task.callCount).toEqual(0);
      });

      it("should not call to stop runner is test.currentTest is not found", async () => {
        getSupportCallbacks({
          pluginEnabled: true,
          shouldSkip: true,
          disableCurrentTest: true,
        });
        afterEachCallback();
        await wait(200);
        expect(Cypress.runner.stop.callCount).toEqual(0);
        expect(cy.task.callCount).toEqual(0);
      });
    });

    describe("before callback", () => {
      it("should not call to reset plugin if browser is not headed", async () => {
        getSupportCallbacks({
          pluginEnabled: true,
          browserIsHeaded: false,
        });
        beforeCallback();
        await wait(200);
        expect(cy.task.callCount).toEqual(0);
      });

      it("should not call to reset plugin if Cypress browser does not exists", async () => {
        getSupportCallbacks({
          pluginEnabled: true,
          removeCypressBrowser: true,
        });
        beforeCallback();
        await wait(200);
        expect(cy.task.callCount).toEqual(0);
      });

      it("should call to reset plugin if browser is headed", async () => {
        getSupportCallbacks({
          pluginEnabled: true,
          browserIsHeaded: true,
        });
        beforeCallback();
        await wait(200);
        expect(cy.task.calledWith("failFastResetSkip")).toEqual(true);
      });

      it("should call to reset plugin if browser is headed when enabled with string", async () => {
        getSupportCallbacks({
          pluginEnabled: "true",
          browserIsHeaded: true,
        });
        beforeCallback();
        await wait(200);
        expect(cy.task.calledWith("failFastResetSkip")).toEqual(true);
      });
    });
  });

  describe("when plugin is enabled and custom configuration is defined", () => {
    describe("afterEach callback", () => {
      it("should not call to stop runner nor set plugin flag if current test config is disabled", () => {
        getSupportCallbacks({
          pluginEnabled: "true",
          testState: "failed",
          testCurrentRetry: 3,
          testRetries: 3,
          customConfig: {
            failFast: {
              enabled: false,
            },
          },
        });
        afterEachCallback();
        expect(Cypress.runner.stop.callCount).toEqual(0);
        expect(cy.task.callCount).toEqual(0);
      });

      it("should not call to stop runner nor set plugin flag if current test config is disabled in parent", () => {
        getSupportCallbacks({
          pluginEnabled: "true",
          testState: "failed",
          testCurrentRetry: 3,
          testRetries: 3,
          testParent: {
            cfg: {
              failFast: {
                enabled: false,
              },
            },
          },
        });
        afterEachCallback();
        expect(Cypress.runner.stop.callCount).toEqual(0);
        expect(cy.task.callCount).toEqual(0);
      });

      it("should not call to stop runner nor set plugin flag if current test config is disabled in grandparent", () => {
        getSupportCallbacks({
          pluginEnabled: "true",
          testState: "failed",
          testCurrentRetry: 3,
          testRetries: 3,
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
        afterEachCallback();
        expect(Cypress.runner.stop.callCount).toEqual(0);
        expect(cy.task.callCount).toEqual(0);
      });

      it("should call to stop runner if current test config is disabled in grandparent but enabled in test", () => {
        getSupportCallbacks({
          pluginEnabled: "true",
          testState: "failed",
          testCurrentRetry: 3,
          testRetries: 3,
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
        afterEachCallback();
        expect(Cypress.runner.stop.callCount).toEqual(1);
        expect(cy.task.callCount).toEqual(1);
      });
    });
  });
});
