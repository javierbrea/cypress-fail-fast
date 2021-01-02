const sinon = require("sinon");
const plugin = require("../src/plugin");

describe("plugin", () => {
  let onEventSpy;
  let sandbox;
  let eventName;
  let shouldSkipDueToFailFast;
  let resetShouldSkipDueToFailFast;

  const getPluginMethods = () => {
    plugin(onEventSpy);
    eventName = onEventSpy.getCall(0).args[0];
    shouldSkipDueToFailFast = onEventSpy.getCall(0).args[1].shouldSkipDueToFailFast;
    resetShouldSkipDueToFailFast = onEventSpy.getCall(0).args[1].resetShouldSkipDueToFailFast;
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
      expect(shouldSkipDueToFailFast()).toEqual(false);
    });

    it("should return shouldSkip flag as true after setting it as true", () => {
      getPluginMethods();
      shouldSkipDueToFailFast(true);
      expect(shouldSkipDueToFailFast()).toEqual(true);
    });
  });

  describe("when it is enabled using boolean", () => {
    it("should return shouldSkip flag as false by default when plugin ", () => {
      getPluginMethods();
      expect(shouldSkipDueToFailFast()).toEqual(false);
    });

    it("should return shouldSkip flag as true after setting it as true", () => {
      getPluginMethods();
      shouldSkipDueToFailFast(true);
      expect(shouldSkipDueToFailFast()).toEqual(true);
    });

    it("should reset shouldSkip flag after calling to reset method", () => {
      getPluginMethods();
      shouldSkipDueToFailFast(true);
      expect(shouldSkipDueToFailFast()).toEqual(true);
      resetShouldSkipDueToFailFast();
      expect(shouldSkipDueToFailFast()).toEqual(false);
    });
  });

  describe("when it is enabled using string", () => {
    it("should return shouldSkip flag as false by default when plugin ", () => {
      getPluginMethods();
      expect(shouldSkipDueToFailFast()).toEqual(false);
    });

    it("should return shouldSkip flag as true after setting it as true", () => {
      getPluginMethods();
      shouldSkipDueToFailFast(true);
      expect(shouldSkipDueToFailFast()).toEqual(true);
    });

    it("should reset shouldSkip flag after calling to reset method", () => {
      getPluginMethods();
      shouldSkipDueToFailFast(true);
      expect(shouldSkipDueToFailFast()).toEqual(true);
      resetShouldSkipDueToFailFast();
      expect(shouldSkipDueToFailFast()).toEqual(false);
    });
  });
});
