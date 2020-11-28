const { npmRun } = require("./npmCommandRunner");

describe("plugin", () => {
  let logs;

  beforeAll(async () => {
    logs = await npmRun(["serve-and-cypress:run"]);
  }, 60000);

  it("should have runned four tests", () => {
    expect(logs).toEqual(expect.stringMatching(/\s*│\s*Tests:\s*4/));
  });

  it("should have passed one tests", () => {
    expect(logs).toEqual(expect.stringMatching(/\s*│\s*Passing:\s*1/));
  });

  it("should have failed one test", () => {
    expect(logs).toEqual(expect.stringMatching(/\s*│\s*Failing:\s*1/));
  });

  it("should have skipped two tests", () => {
    expect(logs).toEqual(expect.stringMatching(/\s*│\s*Skipped:\s*2/));
  });

  it("should have skipped four tests in second file", () => {
    expect(logs).toEqual(expect.stringMatching(/\s*│\s*Skipped:\s*4/));
  });
});
