const { PLUGIN_ENVIRONMENT_VAR } = require("./helpers");

function shouldFailFast(config) {
  return (
    config.env[PLUGIN_ENVIRONMENT_VAR] === true || config.env[PLUGIN_ENVIRONMENT_VAR] === "true"
  );
}

module.exports = (on, config) => {
  // Expose fail fast tasks
  let shouldSkip = false;

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
