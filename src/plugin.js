const { shouldFailFast } = require("./helpers");

let shouldSkip = false;

module.exports = (on, config) => {
  // Expose fail fast tasks

  on("task", {
    resetShouldSkipDueToFailFast() {
      shouldSkip = false;
      return null;
    },
    shouldSkipDueToFailFast(value) {
      if (value === true && shouldFailFast(config)) {
        shouldSkip = value;
      }
      return shouldSkip;
    },
  });

  return config;
};
