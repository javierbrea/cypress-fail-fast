import fsExtra = require("fs-extra");
import path = require("path");

import cypressFailFast = require("../support/cypress-fail-fast/plugin");

const storageFolder = path.resolve(__dirname, "..", "..", "..", "..", "parallel-storage");

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

export default (on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions): Cypress.ResolvedConfigOptions => {
  cypressFailFast(on, config, {
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

  return config;
};
