const cypressVariants = require("../commands/support/variants");
const { copyCypressSpecs } = require("../commands/support/copy");
const { npmRun } = require("./support/npmCommandRunner");
const { splitLogsBySpec } = require("./support/logs");

const runVariantTests = (cypressVariant, specsFolder, tests) => {
  describe(`Executed in ${cypressVariant.name}`, () => {
    let logs;
    const getLogs = (specIndex) => logs[specIndex];

    beforeAll(async () => {
      copyCypressSpecs(specsFolder, cypressVariant);
      logs = splitLogsBySpec(await npmRun(["cypress:run"], cypressVariant.path));
    }, 60000);

    tests(getLogs);
  });
};

const runSpecsTests = (description, specsFolder, tests) => {
  describe(description, () => {
    cypressVariants.forEach((cypressVariant) => {
      runVariantTests(cypressVariant, specsFolder, tests);
    });
  });
};

runSpecsTests(
  "When it is configured using only environment variable",
  "environment-config-only",
  (getLogs) => {
    describe("First spec", () => {
      let logs;
      beforeEach(() => {
        logs = getLogs(1);
      });

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
    });

    describe("Second spec", () => {
      let logs;
      beforeEach(() => {
        logs = getLogs(2);
      });

      it("should have skipped four tests", () => {
        expect(logs).toEqual(expect.stringMatching(/\s*│\s*Skipped:\s*4/));
      });
    });

    describe("Third spec", () => {
      let logs;
      beforeEach(() => {
        logs = getLogs(3);
      });

      it("should have skipped three tests", () => {
        expect(logs).toEqual(expect.stringMatching(/\s*│\s*Skipped:\s*3/));
      });
    });
  }
);
