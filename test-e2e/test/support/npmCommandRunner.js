const path = require("path");
const childProcess = require("child_process");
const stripAnsi = require("strip-ansi");

const ENCODING_TYPE = "utf8";
const VARIANTS_FOLDER = path.resolve(__dirname, "..", "..", "cypress-variants");

const npmRun = (commands, variant, env) => {
  let npmProcess;
  const logs = [];
  const logData = (log) => {
    const cleanLog = stripAnsi(log.trim());
    if (cleanLog.length) {
      console.log(cleanLog);
      logs.push(cleanLog);
    }
  };

  return new Promise((resolve) => {
    const commandsArray = Array.isArray(commands) ? commands : [commands];
    npmProcess = childProcess.spawn("npm", ["run"].concat(commandsArray), {
      cwd: path.resolve(VARIANTS_FOLDER, variant),
      env: {
        ...process.env,
        ...env,
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
};

module.exports = {
  npmRun,
  VARIANTS_FOLDER,
};
