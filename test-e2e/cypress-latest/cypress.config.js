const cypressFailFastPlugin = require("cypress-fail-fast/plugin");

const specPattern = process.env.SPECS_FOLDER
  ? `cypress/e2e/${process.env.SPECS_FOLDER}/**.cy.js`
  : "cypress/e2e/**/*.cy.js";

module.exports = {
  e2e: {
    baseUrl: "http://localhost:3000",
    setupNodeEvents(on, config) {
      /**
       * @returns {void | Promise<void>}
       */
      const onFailFastTriggeredHook = ({ strategy, test }) => {
        const execute = () => {
          // eslint-disable-next-line no-console
          console.log(
            `Fail-fast triggered with strategy "${strategy}" by test "${test.fullTitle}"`,
          );
        };
        if (process.env.ASYNC_HOOKS === "true") {
          return new Promise((resolve) => {
            setTimeout(() => {
              execute();
              resolve();
            }, 2000);
          });
        }
        return execute();
      };

      let executedBeforeEach = 0;
      let consolePrinted = false;

      /**
       * @returns {boolean | Promise<boolean>}
       */
      const shouldTriggerFailFastHook = () => {
        const execute = () => {
          executedBeforeEach++;
          if (
            executedBeforeEach >
            Number(process.env.ENABLE_SKIP_MODE_AFTER_TESTS)
          ) {
            if (!consolePrinted) {
              consolePrinted = true;
              // eslint-disable-next-line no-console
              console.log(
                `Custom shouldTriggerFailFast hook triggered fail-fast mode after ${executedBeforeEach - 1} tests executed`,
              );
            }
            return true;
          }
          return false;
        };
        if (process.env.ASYNC_HOOKS === "true") {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve(execute());
            }, 2000);
          });
        }
        return execute();
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
    specPattern: [specPattern],
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
