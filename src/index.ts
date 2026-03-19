import { registerFailFast } from "./Browser/FailFast";

export type { FailFastConfig } from "./Shared/Config.types";

/**
 * Cypress type augmentations for fail-fast configuration options.
 */

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface FailFastTestConfigOptions {
      /**
       * Disables fail-fast plugin.
       * If a test fails, the rest of tests won't be skipped.
       */
      enabled?: boolean;
    }

    interface TestConfigOverrides {
      /**
       * Configuration for fail-fast plugin on test level.
       */
      failFast?: FailFastTestConfigOptions;
    }

    interface SuiteConfigOverrides {
      /**
       * Configuration for fail-fast plugin on suite level.
       */
      failFast?: FailFastTestConfigOptions;
    }
  }
}

const plugin = registerFailFast(Cypress, cy, before, beforeEach, afterEach);

/**
 * Registers fail-fast browser hooks for use in Cypress support files.
 */
export default plugin;

// For CommonJS compatibility
module.exports = plugin;
