const sinon = require("sinon");
const plugin = require("../src/plugin");

describe("plugin", () => {
  let onEventSpy;
  let sandbox;
  let eventName;
  let failFastShouldSkip;
  let failFastResetSkip;

  const getPluginMethods = () => {
    plugin(onEventSpy);
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
    it("should return shouldSkip flag as false by default when plugin ", () => {
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
    it("should return shouldSkip flag as false by default when plugin ", () => {
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
});
