import plugin = require("../../../plugin");

export default {
  e2e: {
    baseUrl: "http://localhost:3000",
    setupNodeEvents(on, config) {
      plugin(on, config);
      // Add log task
      on("task", {
        log: function (message) {
          console.log(message);
          return null;
        },
      });
      return config;
    },
    specPattern: "cypress/integration/**/*.ts",
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
