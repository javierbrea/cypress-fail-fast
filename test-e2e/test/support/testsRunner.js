const cypressVariants = require("../../commands/support/variants");
const { copyCypressSpecs } = require("../../commands/support/copy");
const { npmRun } = require("./npmCommandRunner");
const { splitLogsBySpec } = require("./logs");

const BEFORE_HOOK_LOG = "Executing before hook";

const pluralize = (text, amount) => {
  return amount < 2 ? text : `${text}s`;
};

const expectTestsAmount = (status, statusKey, amount, getSpecLogs) => {
  if (amount !== null) {
    it(`should have ${status} ${amount} ${pluralize("test", amount)}`, () => {
      expect(getSpecLogs()).toEqual(
        expect.stringMatching(new RegExp(`\\s*│\\s*${statusKey}:\\s*${amount}`))
      );
    });
  }
};

const expectLogPrinted = (log, getSpecLogs) => {
  it(`should have logged "${log}"`, () => {
    expect(getSpecLogs()).toEqual(expect.stringContaining(log));
  });
};

const expectLogNotPrinted = (log, getSpecLogs) => {
  it(`should have not logged "${log}"`, () => {
    expect(getSpecLogs()).toEqual(expect.not.stringContaining(log));
  });
};

const getSpecTests = (
  { spec = 1, logBefore = true, executed = null, passed = null, failed = null, skipped = null },
  getLogs
) => {
  const getSpecLogs = () => getLogs(spec);
  describe(`Spec ${spec}`, () => {
    if (logBefore) {
      expectLogPrinted(BEFORE_HOOK_LOG, getSpecLogs);
    } else {
      expectLogNotPrinted(BEFORE_HOOK_LOG, getSpecLogs);
    }
    expectTestsAmount("executed", "Tests", executed, getSpecLogs);
    expectTestsAmount("passed", "Passing", passed, getSpecLogs);
    expectTestsAmount("failed", "Failing", failed, getSpecLogs);
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
      copyCypressSpecs(options.specs, cypressVariant);
      logs = splitLogsBySpec(await npmRun(["cypress:run"], cypressVariant.path, options.env));
    }, 60000);

    tests(getLogs);
  });
};

const runSpecsTests = (description, options = {}) => {
  describe(description, () => {
    cypressVariants.forEach((cypressVariant) => {
      if (options.skipVariants && cypressVariant.skippable) {
        return;
      }
      runVariantTests(cypressVariant, getSpecsStatusesTests(options.specsResults), options);
    });
  });
};

module.exports = {
  runSpecsTests,
};
