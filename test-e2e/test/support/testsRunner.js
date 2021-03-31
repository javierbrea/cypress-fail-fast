const path = require("path");
const fs = require("fs");
const cypressVariants = require("../../commands/support/variants");
const { copyCypressSpecs, copyCypressPluginFile } = require("../../commands/support/copy");
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

const getParallelSpecsStatusesTests = (runIndex, specsExpectedStatuses) => {
  return (getLogs, getReport) => {
    describe(`Run ${runIndex}`, () => {
      specsExpectedStatuses.forEach((specExpectedStatuses, index) => {
        getSpecTests({ ...specExpectedStatuses, spec: index + 1 }, getLogs, getReport);
      });
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

const runParallelTests = (
  cypressVariant1,
  cypressVariant2,
  tests1,
  tests2,
  options1 = {},
  options2 = {},
  commonOptions = {}
) => {
  describe(`Running in parallel ${cypressVariant1.name}:${options1.specs} and ${cypressVariant2.name}:${options2.specs}`, () => {
    let logs1;
    let logs2;
    let report1;
    let report2;
    const getLogs1 = (specIndex) => logs1[specIndex];
    const getReport1 = () => report1;
    const getLogs2 = (specIndex) => logs2[specIndex];
    const getReport2 = () => report2;

    beforeAll(async () => {
      copyCypressSpecs(options1.specs, cypressVariant1);
      copyCypressSpecs(options2.specs, cypressVariant2);
      if (options1.pluginFile) {
        copyCypressPluginFile(
          cypressVariant1.path,
          cypressVariant1.typescript,
          options1.pluginFile
        );
      }
      if (options2.pluginFile) {
        copyCypressPluginFile(
          cypressVariant2.path,
          cypressVariant2.typescript,
          options2.pluginFile
        );
      }
      const logs = await Promise.all([
        npmRun(["cypress:run"], cypressVariant1.path, options1.env),
        npmRun(["cypress:run"], cypressVariant2.path, options2.env),
      ]);

      logs1 = splitLogsBySpec(logs[0]);
      logs2 = splitLogsBySpec(logs[1]);
      await npmRun(["report:create"], cypressVariant1.path, options1.env);
      await npmRun(["report:create"], cypressVariant2.path, options2.env);
      report1 = await readReport(cypressVariant1.path);
      report2 = await readReport(cypressVariant2.path);
    }, 60000);

    afterAll(() => {
      if (options1.pluginFile) {
        copyCypressPluginFile(cypressVariant1.path, cypressVariant1.typescript);
      }
      if (options2.pluginFile) {
        copyCypressPluginFile(cypressVariant2.path, cypressVariant2.typescript);
      }
      if (commonOptions.afterAll) {
        commonOptions.afterAll();
      }
    });

    tests1(getLogs1, getReport1);
    tests2(getLogs2, getReport2);
  });
};

const runParallelSpecsTests = (description, runsOptions, options) => {
  describe(description, () => {
    runParallelTests(
      runsOptions[0].cypress,
      runsOptions[1].cypress,
      getParallelSpecsStatusesTests(1, runsOptions[0].specsResults),
      getParallelSpecsStatusesTests(2, runsOptions[1].specsResults),
      runsOptions[0],
      runsOptions[1],
      options
    );
  });
};

module.exports = {
  runSpecsTests,
  runParallelSpecsTests,
};
