const sinon = require("sinon");
const plugin = require("../src/plugin");

describe("plugin", () => {
  let onEventSpy;
  let sandbox;
  let eventName;
  let failFastShouldSkip;
  let failFastResetSkip;

  const getPluginMethods = (config, env) => {
    plugin(onEventSpy, { env: env || {} }, config);
    eventName = onEventSpy.getCall(0).args[0];
    failFastShouldSkip = onEventSpy.getCall(0).args[1].failFastShouldSkip;
    failFastResetSkip = onEventSpy.getCall(0).args[1].failFastResetSkip;
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

  describe("when it is disabled", () => {
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

  describe("when it is enabled using boolean", () => {
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

  describe("when it is enabled using string", () => {
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
          env
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
          env
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
          env
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
          env
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
          env
        );
        failFastShouldSkip();
        failFastShouldSkip(false);
        expect(spy.callCount).toEqual(0);
      });
    });
  });
});
