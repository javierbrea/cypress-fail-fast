const chalk = require("chalk");
const {
  SHOULD_SKIP_TASK,
  RESET_SKIP_TASK,
  LOG_TASK,
  STRATEGY_ENVIRONMENT_VAR,
  strategyIsParallel,
} = require("./helpers");

module.exports = (on, config, pluginConfig = {}) => {
  // store skip flag
  let shouldSkipFlag = false;

  const parallelCallbacks =
    strategyIsParallel(config.env[STRATEGY_ENVIRONMENT_VAR]) && !!pluginConfig.parallelCallbacks
      ? pluginConfig.parallelCallbacks
      : {};
  const isCancelledCallback = parallelCallbacks.isCancelled;
  const onCancelCallback = parallelCallbacks.onCancel;

  const shouldSkip = () => {
    if (!!shouldSkipFlag) {
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
    [LOG_TASK]: function (message) {
      console.log(`${chalk.yellow("[fail-fast]")} ${message}`);
      return null;
    },
  });

  return config;
};
