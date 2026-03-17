const { pnpmRun } = require("./commandRunner");
const { splitLogsBySpec } = require("./logs");

const pluralize = (text, amount) => {
  return amount < 2 ? text : `${text}s`;
};

const expectTestsAmount = (status, statusKey, amount, getSpecLogs) => {
  if (amount !== null) {
    it(`should have ${status} ${amount} ${pluralize("test", amount)}`, () => {
      expect(getSpecLogs()).toEqual(
        expect.stringMatching(
          new RegExp(`\\s*│\\s*${statusKey}:\\s*${amount}`),
        ),
      );
    });
  }
};

const getSpecTests = (
  { spec = 1, executed = null, passed = null, failed = null, skipped = null },
  getLogs,
) => {
  const getSpecLogs = () => getLogs(spec);
  describe(`Spec ${spec}`, () => {
    expectTestsAmount("executed", "Tests", executed, getSpecLogs);
    expectTestsAmount("passed", "Passing", passed, getSpecLogs);
    expectTestsAmount("failed", "Failing", failed, getSpecLogs);
    expectTestsAmount("pending", "Pending", failed, getSpecLogs);
    expectTestsAmount("skipped", "Skipped", skipped, getSpecLogs);
  });
};

const getSpecsStatusesTests = (specsExpectedStatuses) => {
  return (getLogs) => {
    specsExpectedStatuses.forEach((specExpectedStatuses, index) => {
      getSpecTests({ ...specExpectedStatuses, spec: index + 1 }, getLogs);
    });
  };
};

const runVariantTests = (cypressVariant, tests, options = {}) => {
  describe(`Executed in ${cypressVariant.name}`, () => {
    let logs;
    const getLogs = (specIndex) => logs[specIndex];

    beforeAll(async () => {
      logs = splitLogsBySpec(
        await pnpmRun(["cypress:run"], cypressVariant.path, options.env),
      );
    }, 120000);

    tests(getLogs);
  });
};

const runSpecsTests = (description, options = {}) => {
  describe(`${description}`, () => {
    runVariantTests(
      { name: "cypress latest", path: "cypress-latest" },
      getSpecsStatusesTests(options.specsResults),
      options,
    );
  });
};

// eslint-disable-next-line jest/no-export
module.exports = {
  runSpecsTests,
};
