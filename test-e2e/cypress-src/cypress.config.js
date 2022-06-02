const webpackPreprocessor = require("@cypress/webpack-preprocessor");
const defaults = webpackPreprocessor.defaultOptions;

module.exports = {
  e2e: {
    baseUrl: "http://localhost:3000",
    setupNodeEvents(on, config) {
      require("../../../plugin")(on, config);
      delete defaults.webpackOptions.module.rules[0].use[0].options.presets;
      on("file:preprocessor", webpackPreprocessor(defaults));
      // Add log task
      on("task", {
        log: function (message) {
          console.log(message);
          return null;
        },
      });
      return config;
    },
    specPattern: "cypress/integration/**/*.js",
  },
  video: false,
  reporter: "mochawesome",
  reporterOptions: {
    reportDir: "cypress/results",
    overwrite: false,
    html: false,
    json: true,
  },
};
