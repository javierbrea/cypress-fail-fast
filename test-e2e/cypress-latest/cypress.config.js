const cypressFailFastPlugin = require("cypress-fail-fast/plugin");

module.exports = {
  e2e: {
    baseUrl: "http://localhost:3000",
    setupNodeEvents(on, config) {
      cypressFailFastPlugin(on, config);
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
    specPattern: [`cypress/e2e/${process.env.SPECS_FOLDER}/**.cy.js`],
  },
  video: false,
  allowCypressEnv: false,
  expose: {
    failFastIgnorePerTestConfig: process.env.CONFIG_IGNORE_PER_TEST_CONFIG,
    failFastEnabled: process.env.CONFIG_ENABLED,
    failFastStrategy: process.env.CONFIG_STRATEGY,
    failFastBail: process.env.CONFIG_BAIL,
  },
};
