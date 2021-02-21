const path = require("path");
const fs = require("fs");
const cypressVariants = require("../../commands/support/variants");
const { copyCypressSpecs } = require("../../commands/support/copy");
const { npmRun, VARIANTS_FOLDER } = require("./npmCommandRunner");
const { splitLogsBySpec } = require("./logs");

const AFTER_EVENT_LOG = "Executed test:after:run event in failed test";
const BEFORE_HOOK_LOG = "Executing before hook";

const readReport = (variantPath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(
      path.resolve(VARIANTS_FOLDER, variantPath, "mochawesome-report", "mochawesome.html"),
      "utf8",
      (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      }
    );
  });
};

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

const expectLogReported = (report, getReport) => {
  it(`should have reported "${report}"`, () => {
    expect(getReport()).toEqual(expect.stringContaining(report));
  });
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
  getLogs,
  getReport
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
    if (failed > 0) {
      expectLogReported(AFTER_EVENT_LOG, getReport);
    }
    expectTestsAmount("skipped", "Skipped", skipped, getSpecLogs);
  });
};

const getSpecsStatusesTests = (specsExpectedStatuses) => {
  return (getLogs, getReport) => {
    specsExpectedStatuses.forEach((specExpectedStatuses, index) => {
      getSpecTests({ ...specExpectedStatuses, spec: index + 1 }, getLogs, getReport);
    });
  };
};

const runVariantTests = (cypressVariant, tests, options = {}) => {
  describe(`Executed in ${cypressVariant.name}`, () => {
    let logs;
    let report;
    const getLogs = (specIndex) => logs[specIndex];
    const getReport = () => report;

    beforeAll(async () => {
      copyCypressSpecs(options.specs, cypressVariant);
      logs = splitLogsBySpec(await npmRun(["cypress:run"], cypressVariant.path, options.env));
      await npmRun(["report:create"], cypressVariant.path, options.env);
      report = await readReport(cypressVariant.path);
    }, 60000);

    tests(getLogs, getReport);
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
