const splitLogsBySpec = (logs) => {
  return logs.split("Running:");
};

module.exports = {
  splitLogsBySpec,
};
