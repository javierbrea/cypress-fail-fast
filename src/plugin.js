module.exports = (on, config) => {
  // Expose fail fast tasks
  let shouldSkip = false;

  on("task", {
    resetShouldSkipDueToFailFast() {
      shouldSkip = false;
      return null;
    },
    shouldSkipDueToFailFast(value) {
      if (value === true) {
        shouldSkip = value;
      }
      return shouldSkip;
    },
  });

  return config;
};
