import fsExtra = require("fs-extra");
import path = require("path");

const storageFile = path.resolve(
  __dirname,
  "..",
  "..",
  "..",
  "..",
  "parallel-storage",
  "parallel-storage.json"
);

import cypressFailFast = require("../support/cypress-fail-fast/plugin");

export default (on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions): Cypress.ResolvedConfigOptions => {
  cypressFailFast(on, config, {
    parallelCallbacks: {
      onCancel: () => {
        fsExtra.writeJsonSync(storageFile, { cancelled: true });
      },
      isCancelled: () => {
        if (fsExtra.pathExistsSync(storageFile)) {
          return fsExtra.readJsonSync(storageFile).cancelled;
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
  });

  return config;
};
