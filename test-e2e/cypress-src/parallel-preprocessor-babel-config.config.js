const fsExtra = require("fs-extra");
const path = require("path");
const webpackPreprocessor = require("@cypress/webpack-preprocessor");
const defaults = webpackPreprocessor.defaultOptions;

const storageFolder = path.resolve(__dirname, "..", "..", "parallel-storage");

const cancelledFile = path.resolve(storageFolder, "run-a-is-cancelled.json");
const waitingFile = path.resolve(storageFolder, "run-b-is-waiting.json");

function waitForFile(filePath) {
  return new Promise((resolve) => {
    console.log(`Waiting until file exists: ${filePath}`);
    const checkFileExists = setInterval(() => {
      if (fsExtra.pathExistsSync(filePath)) {
        clearInterval(checkFileExists);
        console.log(`File exists: ${filePath}`);
        resolve(true);
      }
    }, 500);
    setTimeout(() => {
      console.log(`Timeout. File not exists: ${filePath}`);
      clearInterval(checkFileExists);
      resolve(false);
    }, 20000);
  });
}

module.exports = {
  e2e: {
    baseUrl: "http://localhost:3000",
    setupNodeEvents(on, config) {
      require("../../../plugin")(on, config, {
        parallelCallbacks: {
          onCancel: () => {
            fsExtra.writeJsonSync(cancelledFile, { cancelled: true });
          },
          isCancelled: () => {
            if (fsExtra.pathExistsSync(cancelledFile)) {
              return fsExtra.readJsonSync(cancelledFile).cancelled;
            }
            return false;
          },
        },
      });

      // Add log task
      on("task", {
        log: function (message) {
          console.log(message);
          return null;
        },
        waitUntilRunAIsCancelled: function () {
          return waitForFile(cancelledFile);
        },
        waitUntilRunBIsWaiting: function () {
          return waitForFile(waitingFile);
        },
        runBIsWaiting: function () {
          fsExtra.writeJsonSync(waitingFile, { waiting: true });
          return true;
        },
      });

      delete defaults.webpackOptions.module.rules[0].use[0].options.presets;
      on("file:preprocessor", webpackPreprocessor(defaults));

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
