const { SHOULD_SKIP_TASK, RESET_SKIP_TASK } = require("./helpers");

module.exports = (on, config) => {
  // store skip flag
  let shouldSkip = false;

  // Expose fail fast tasks
  on("task", {
    [RESET_SKIP_TASK]: function () {
      shouldSkip = false;
      return null;
    },
    [SHOULD_SKIP_TASK]: function (value) {
      if (value === true) {
        shouldSkip = value;
      }
      return shouldSkip;
    },
  });

  return config;
};
