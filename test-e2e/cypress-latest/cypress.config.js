const { default: cypressFailFastPlugin } = require("cypress-fail-fast/plugin");

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
    FAIL_FAST_STRATEGY: "run",
    FAIL_FAST_BAIL: 1,
    FAIL_FAST_PLUGIN: 1,
    FAIL_FAST_ENABLED: 1,
  },
};
