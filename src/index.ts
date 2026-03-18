import { registerFailFast } from "./Browser/FailFast";

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

export default registerFailFast(Cypress, cy, before, beforeEach, afterEach);
