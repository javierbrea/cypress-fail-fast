const { npmRun } = require("./support/npmCommandRunner");

const runVariantTests = (description, variant) => {
  describe(`plugin used with ${description}`, () => {
    let logs;

    beforeAll(async () => {
      logs = await npmRun(["cypress:run"], variant);
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
};

runVariantTests("Cypress v5", "cypress-5");
runVariantTests("Cypress v6", "cypress-6");
runVariantTests("TypeScript", "typescript");
