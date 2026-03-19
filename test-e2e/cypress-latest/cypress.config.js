const cypressFailFastPlugin = require("cypress-fail-fast/plugin");

module.exports = {
  e2e: {
    baseUrl: "http://localhost:3000",
    setupNodeEvents(on, config) {
      const onFailFastTriggeredHook = ({ strategy, test }) => {
        // eslint-disable-next-line no-console
        console.log(
          `Fail-fast triggered with strategy "${strategy}" by test "${test.fullTitle}"`,
        );
      };

      let executedTests = 0;
      let consolePrinted = false;

      const shouldTriggerFailFastHook = () => {
        executedTests++;
        if (executedTests >= Number(process.env.ENABLE_SKIP_MODE_AFTER_TESTS)) {
          if (!consolePrinted) {
            consolePrinted = true;
            // eslint-disable-next-line no-console
            console.log(
              `Custom shouldTriggerFailFast hook triggered fail-fast mode after ${executedTests} tests executed`,
            );
          }
          return true;
        }
      };

      const hooks = {};

      if (process.env.ENABLE_ON_FAIL_FAST_TRIGGERED_HOOK === "true") {
        hooks.onFailFastTriggered = onFailFastTriggeredHook;
      }

      if (process.env.ENABLE_SHOULD_TRIGGER_FAIL_FAST_HOOK === "true") {
        hooks.shouldTriggerFailFast = shouldTriggerFailFastHook;
      }

      cypressFailFastPlugin(on, config, {
        hooks,
      });

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
