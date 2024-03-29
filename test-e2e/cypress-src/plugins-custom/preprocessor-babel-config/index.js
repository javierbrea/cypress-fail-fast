const webpackPreprocessor = require("@cypress/webpack-preprocessor");
const defaults = webpackPreprocessor.defaultOptions;

module.exports = (on, config) => {
  require("../../../../../plugin")(on, config);

  // Add log task
  on("task", {
    log: function (message) {
      console.log(message);
      return null;
    },
  });

  delete defaults.webpackOptions.module.rules[0].use[0].options.presets;
  on("file:preprocessor", webpackPreprocessor(defaults));

  return config;
};
