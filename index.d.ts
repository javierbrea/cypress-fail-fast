/// <reference types="cypress" />

declare namespace Cypress {
  interface FailFastConfigOptions {
    /**
     * Disables fail-fast plugin
     * If the test fails, the rest of tests won't be skipped
    */
    enabled?: boolean
  }

  interface TestConfigOverrides {
    /**
     * Configuration for fail-fast plugin
    */
    failFast?: Partial<FailFastConfigOptions>
  }

  interface SuiteConfigOverrides {
    /**
     * Configuration for fail-fast plugin
    */
    failFast?: Partial<FailFastConfigOptions>
  }
}
