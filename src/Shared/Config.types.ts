/**
 * Effective global fail-fast configuration used during a Cypress run.
 */
export type FailFastGlobalConfig = {
  plugin: boolean;
  enabled: boolean;
  strategyIsSpec: boolean;
  bail: number;
};
