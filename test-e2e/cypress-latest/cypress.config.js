const webpackPreprocessor = require("@cypress/webpack-preprocessor");
const defaults = webpackPreprocessor.defaultOptions;

module.exports = {
  e2e: {
    baseUrl: "http://localhost:3000",
    setupNodeEvents(on, config) {
      require("../../plugin")(on, config);
      delete defaults.webpackOptions.module.rules[0].use[0].options.presets;
      on("file:preprocessor", webpackPreprocessor(defaults));
      // Add log task
      on("task", {
        log: function (message) {
          // eslint-disable-next-line no-console
          console.log(message);
          return null;
        },
      });
      return config;
    },
    specPattern: ["cypress/e2e/environment-config-only/**.cy.js"],
  },
  video: false,
  expose: {
    CYPRESS_FAIL_FAST_STRATEGY: process.env.CYPRESS_FAIL_FAST_STRATEGY,
    CYPRESS_FAIL_FAST_BAIL: process.env.CYPRESS_FAIL_FAST_BAIL,
    CYPRESS_FAIL_FAST_PLUGIN: process.env.CYPRESS_FAIL_FAST_PLUGIN,
    CYPRESS_FAIL_FAST_ENABLED: process.env.CYPRESS_FAIL_FAST_ENABLED,
  },
};
