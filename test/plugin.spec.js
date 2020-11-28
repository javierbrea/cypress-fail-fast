const sinon = require("sinon");
const plugin = require("../src/plugin");

describe("plugin", () => {
  let onEventSpy;
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    onEventSpy = sandbox.spy();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should register plugin methods for the task event", () => {
    plugin(onEventSpy);
    expect(onEventSpy.getCall(0).args[0]).toEqual("task");
  });
});
