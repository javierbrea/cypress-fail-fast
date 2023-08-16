const chalk = require("chalk");
const {
  SHOULD_SKIP_TASK,
  RESET_SKIP_TASK,
  FAILED_TESTS_TASK,
  RESET_FAILED_TESTS_TASK,
  LOG_TASK,
  STRATEGY_ENVIRONMENT_VAR,
  LOG_PREFIX,
} = require("./helpers/constants");

const { strategyIsParallel } = require("./helpers/config");

module.exports = (on, config, pluginConfig = {}) => {
  // store skip flag
  let shouldSkipFlag = false;
  let failedTests = 0;

  const parallelCallbacks =
    strategyIsParallel(config.env[STRATEGY_ENVIRONMENT_VAR]) && !!pluginConfig.parallelCallbacks
      ? pluginConfig.parallelCallbacks
      : {};
  const isCancelledCallback = parallelCallbacks.isCancelled;
  const onCancelCallback = parallelCallbacks.onCancel;

  const shouldSkip = () => {
    if (shouldSkipFlag) {
      return shouldSkipFlag;
    }
    if (isCancelledCallback) {
      shouldSkipFlag = isCancelledCallback() || false;
    }
    return shouldSkipFlag;
  };

  // Expose fail fast tasks
  on("task", {
    [RESET_SKIP_TASK]: function () {
      shouldSkipFlag = false;
      return null;
    },
    [SHOULD_SKIP_TASK]: function (value) {
      if (value === true) {
        if (onCancelCallback) {
          onCancelCallback();
        }
        shouldSkipFlag = value;
      }
      return shouldSkip();
    },
    [FAILED_TESTS_TASK]: function (value) {
      if (value === true) {
        failedTests++;
      }
      return failedTests;
    },
    [RESET_FAILED_TESTS_TASK]: function () {
      failedTests = 0;
      return null;
    },
    [LOG_TASK]: function (message) {
      console.log(`${chalk.yellow(LOG_PREFIX)} ${message}`);
      return null;
    },
  });

  return config;
};
