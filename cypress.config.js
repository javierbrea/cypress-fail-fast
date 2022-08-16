module.exports = {
  e2e: {
    baseUrl: "http://localhost:3000",
    setupNodeEvents(on, config) {
      require("cypress-fail-fast/plugin")(on, config);
      return config;
    },
    specPattern: [
      "cypress/e2e/*.ts",
    ],
  },
  video: false,
};
