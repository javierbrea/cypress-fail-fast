const fsExtra = require("fs-extra");
const path = require("path");

const storageFile = path.resolve(
  __dirname,
  "..",
  "..",
  "..",
  "..",
  "parallel-storage",
  "parallel-storage.json"
);

module.exports = (on, config) => {
  require("../../../../../plugin")(on, config, {
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

  // Add log task
  on("task", {
    log: function (message) {
      console.log(message);
      return null;
    },
  });

  return config;
};
