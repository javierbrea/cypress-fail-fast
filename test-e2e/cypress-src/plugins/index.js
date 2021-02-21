module.exports = (on, config) => {
  require("../../../../../plugin")(on, config);

  // Add log task
  on("task", {
    log: function (message) {
      console.log(message);
      return null;
    },
  });

  return config;
};
