import path from "node:path";
import { spawn } from "node:child_process";
import stripAnsi from "strip-ansi";

const ENCODING_TYPE = "utf8";
const E2E_FOLDER = path.resolve(__dirname, "..", "..", "..");

/** Options accepted by {@link pnpmRun}. */
interface PnpmRunOptions {
  /**
   * When `true`, the returned promise resolves with the process exit code
   * instead of the collected stdout/stderr logs.
   */
  getCode?: boolean;
}

/**
 * Runs one or more pnpm scripts inside a Cypress e2e variant directory,
 * collects the combined stdout/stderr output and resolves with it.
 *
 * @param commands - The pnpm script name(s) to execute.
 * @param variant - Subdirectory name inside the e2e folder where the command runs.
 * @param env - Additional environment variables merged into the child-process environment.
 * @param options - Optional options object; omit or pass `{ getCode: false }` to resolve with logs.
 * @returns A promise that resolves with the joined log string.
 */
export function pnpmRun(
  commands: string | string[],
  variant: string,
  env: Record<string, string | undefined>,
  { getCode = false }: PnpmRunOptions = {},
): Promise<string> {
  const logs: string[] = [];

  const logData = (log: string): void => {
    const cleanLog = stripAnsi(log.trim());
    if (cleanLog.length) {
      if (process.env["DEBUG"] === "true") {
        // eslint-disable-next-line no-console
        console.log(cleanLog);
      }
      logs.push(cleanLog);
    }
  };

  return new Promise((resolve) => {
    const commandsArray = Array.isArray(commands) ? commands : [commands];
    const npmProcess = spawn("pnpm", ["run"].concat(commandsArray), {
      cwd: path.resolve(E2E_FOLDER, variant),
      env: {
        ...process.env,
        ...env,
      },
    });

    npmProcess.stdout.setEncoding(ENCODING_TYPE);
    npmProcess.stderr.setEncoding(ENCODING_TYPE);
    npmProcess.stdout.on("data", logData);
    npmProcess.stderr.on("data", logData);

    npmProcess.on("close", (code: number | null) => {
      if (getCode) {
        resolve(code?.toString() ?? "");
      } else {
        resolve(logs.join("\n"));
      }
    });
  });
}
