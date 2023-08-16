const sinon = require("sinon");
const chalk = require("chalk");
const plugin = require("../src/plugin");

describe("plugin", () => {
  let onEventSpy;
  let sandbox;
  let eventName;
  let failFastShouldSkip;
  let failFastResetSkip;
  let failFastLog;
  let failFastFailedTests;
  let failFastResetFailedTests;

  const getPluginMethods = (config, env) => {
    plugin(onEventSpy, { env: env || {} }, config);
    eventName = onEventSpy.getCall(0).args[0];
    failFastShouldSkip = onEventSpy.getCall(0).args[1].failFastShouldSkip;
    failFastResetSkip = onEventSpy.getCall(0).args[1].failFastResetSkip;
    failFastFailedTests = onEventSpy.getCall(0).args[1].failFastFailedTests;
    failFastResetFailedTests = onEventSpy.getCall(0).args[1].failFastResetFailedTests;
    failFastLog = onEventSpy.getCall(0).args[1].failFastLog;
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    onEventSpy = sandbox.spy();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("when initialized", () => {
    it("should register plugin methods for the task event", () => {
      getPluginMethods();
      expect(eventName).toEqual("task");
    });
  });

  describe("shouldSkip task", () => {
    describe("when plugin is disabled", () => {
      it("should return shouldSkip flag as false by default", () => {
        getPluginMethods();
        expect(failFastShouldSkip()).toEqual(false);
      });

      it("should return shouldSkip flag as true after setting it as true", () => {
        getPluginMethods();
        failFastShouldSkip(true);
        expect(failFastShouldSkip()).toEqual(true);
      });
    });

    describe("when plugin is enabled using boolean", () => {
      it("should return shouldSkip flag as false by default", () => {
        getPluginMethods();
        expect(failFastShouldSkip()).toEqual(false);
      });

      it("should return shouldSkip flag as true after setting it as true", () => {
        getPluginMethods();
        failFastShouldSkip(true);
        expect(failFastShouldSkip()).toEqual(true);
      });

      it("should reset shouldSkip flag after calling to reset method", () => {
        getPluginMethods();
        failFastShouldSkip(true);
        expect(failFastShouldSkip()).toEqual(true);
        failFastResetSkip();
        expect(failFastShouldSkip()).toEqual(false);
      });
    });

    describe("when plugin is enabled using string", () => {
      it("should return shouldSkip flag as false by default", () => {
        getPluginMethods();
        expect(failFastShouldSkip()).toEqual(false);
      });

      it("should return shouldSkip flag as true after setting it as true", () => {
        getPluginMethods();
        failFastShouldSkip(true);
        expect(failFastShouldSkip()).toEqual(true);
      });

      it("should reset shouldSkip flag after calling to reset method", () => {
        getPluginMethods();
        failFastShouldSkip(true);
        expect(failFastShouldSkip()).toEqual(true);
        failFastResetSkip();
        expect(failFastShouldSkip()).toEqual(false);
      });
    });

    describe("when parallel callbacks are provided", () => {
      describe("when strategy is parallel", () => {
        const env = {
          FAIL_FAST_STRATEGY: "parallel",
        };

        it("should return shouldSkip flag as true if flag is false but isCancelled callback returns true", () => {
          getPluginMethods(
            {
              parallelCallbacks: {
                isCancelled: () => true,
              },
            },
            env,
          );
          expect(failFastShouldSkip()).toEqual(true);
        });

        it("should return shouldSkip flag as false if flag is false and isCancelled callback does not return value", () => {
          getPluginMethods(
            {
              parallelCallbacks: {
                isCancelled: () => null,
              },
            },
            env,
          );
          expect(failFastShouldSkip()).toEqual(false);
        });

        it("should return shouldSkip flag as true if flag is true even when isCancelled callback returns false", () => {
          getPluginMethods(
            {
              parallelCallbacks: {
                isCancelled: () => false,
              },
            },
            env,
          );
          failFastShouldSkip(true);
          expect(failFastShouldSkip()).toEqual(true);
        });

        it("should call to onCancel callback when shouldSkip flag is set to true", () => {
          const spy = sandbox.spy();
          getPluginMethods(
            {
              parallelCallbacks: {
                onCancel: spy,
              },
            },
            env,
          );
          failFastShouldSkip(true);
          expect(spy.callCount).toEqual(1);
        });

        it("should not call to onCancel callback when shouldSkip flag is set with a value different to true", () => {
          const spy = sandbox.spy();
          getPluginMethods(
            {
              parallelCallbacks: {
                onCancel: spy,
              },
            },
            env,
          );
          failFastShouldSkip();
          failFastShouldSkip(false);
          expect(spy.callCount).toEqual(0);
        });
      });

      describe("when strategy is not parallel", () => {
        const env = {
          FAIL_FAST_STRATEGY: "run",
        };

        it("should return shouldSkip flag as false if flag is false but isCancelled callback returns true", () => {
          getPluginMethods(
            {
              parallelCallbacks: {
                isCancelled: () => true,
              },
            },
            env,
          );
          expect(failFastShouldSkip()).toEqual(false);
        });

        it("should not call to isCancelled callback", () => {
          const spy = sandbox.spy();
          getPluginMethods(
            {
              parallelCallbacks: {
                isCancelled: spy,
              },
            },
            env,
          );
          failFastShouldSkip();
          expect(spy.callCount).toEqual(0);
        });
      });
    });
  });

  describe("failedTests task", () => {
    it("should return 0 failed tests when initialized", () => {
      getPluginMethods();
      expect(failFastFailedTests()).toEqual(0);
    });

    it("should increase amount of failed tests when called with true", () => {
      getPluginMethods();
      failFastFailedTests(true);
      failFastFailedTests(true);
      expect(failFastFailedTests()).toEqual(2);
    });

    it("should return 0 failed tests after calling to resetFailedTests task", () => {
      getPluginMethods();
      failFastFailedTests(true);
      failFastFailedTests(true);
      failFastResetFailedTests();
      expect(failFastFailedTests()).toEqual(0);
    });
  });

  describe("log task", () => {
    it("should call to console.log adding the plugin name", () => {
      const MESSAGE = "Foo message";
      getPluginMethods();
      sandbox.spy(console, "log");
      failFastLog(MESSAGE);
      expect(console.log.getCall(0).args[0]).toEqual(`${chalk.yellow("[fail-fast]")} ${MESSAGE}`);
    });

    it("should return null", () => {
      getPluginMethods();
      expect(failFastLog("foo")).toEqual(null);
    });
  });
});
