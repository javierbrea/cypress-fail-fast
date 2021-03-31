const { SHOULD_SKIP_TASK, RESET_SKIP_TASK } = require("./helpers");

module.exports = (on, config, pluginConfig = {}) => {
  // store skip flag
  let shouldSkipFlag = false;

  const parallelCallbacks = pluginConfig.parallelCallbacks || {};
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
  });

  return config;
};
