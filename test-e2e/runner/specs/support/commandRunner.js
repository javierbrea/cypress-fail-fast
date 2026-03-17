const path = require("path");
const childProcess = require("child_process");
const stripAnsi = require("strip-ansi");

const ENCODING_TYPE = "utf8";
const E2E_FOLDER = path.resolve(__dirname, "..", "..", "..");

const pnpmRun = (commands, variant, env, { getCode = false } = {}) => {
  let npmProcess;
  const logs = [];
  const logData = (log) => {
    const cleanLog = stripAnsi(log.trim());
    if (cleanLog.length) {
      if (process.env.DEBUG === "true") {
        // eslint-disable-next-line no-console
        console.log(cleanLog);
      }
      logs.push(cleanLog);
    }
  };

  return new Promise((resolve) => {
    const commandsArray = Array.isArray(commands) ? commands : [commands];
    npmProcess = childProcess.spawn("pnpm", ["run"].concat(commandsArray), {
      cwd: path.resolve(E2E_FOLDER, variant),
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

    npmProcess.on("close", (code) => {
      if (getCode) {
        resolve(code);
      } else {
        resolve(logs.join("\n"));
      }
    });
  });
};

module.exports = {
  pnpmRun,
};
