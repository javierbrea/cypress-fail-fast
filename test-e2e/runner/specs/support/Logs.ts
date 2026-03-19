/**
 * Splits the combined pnpm output into individual sections, one per Cypress spec file.
 *
 * The Cypress CLI prefixes every spec run with the string `"Running:"`, so splitting
 * on that token gives one entry per spec (the first entry is the text before any spec
 * and is typically empty or contains only the initial bootstrap output).
 *
 * @param logs - The full stdout/stderr string produced by a Cypress run.
 * @returns An array of log sections split at each `"Running:"` header.
 */
export const splitLogsBySpec = (logs: string): string[] => {
  return logs.split("Running:");
};
