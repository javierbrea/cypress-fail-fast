const path = require("path");
const childProcess = require("child_process");
const stripAnsi = require("strip-ansi");

const ENCODING_TYPE = "utf8";
const ROOT_FOLDER = path.resolve(__dirname, "..");

const npmRun = (commands, envVars) => {
  let npmProcess;
  const logs = [];
  const logData = (log) => {
    const cleanLog = stripAnsi(log.trim());
    if (cleanLog.length) {
      console.log(cleanLog);
      logs.push(cleanLog);
    }
  };

  const promise = new Promise((resolve) => {
    const commandsArray = Array.isArray(commands) ? commands : [commands];
    npmProcess = childProcess.spawn("npm", ["run"].concat(commandsArray), {
      cwd: ROOT_FOLDER,
      env: {
        ...process.env,
        ...envVars,
      },
    });

    npmProcess.stdin.setEncoding(ENCODING_TYPE);
    npmProcess.stdout.setEncoding(ENCODING_TYPE);
    npmProcess.stderr.setEncoding(ENCODING_TYPE);
    npmProcess.stdout.on("data", logData);
    npmProcess.stderr.on("data", logData);

    npmProcess.on("close", () => {
      resolve(logs.join("\n"));
    });
  });

  return promise;
};

module.exports = {
  npmRun,
};
