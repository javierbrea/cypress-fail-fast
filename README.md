[![Build status][build-image]][build-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Quality Gate][quality-gate-image]][quality-gate-url] [![Mutation testing badge](https://img.shields.io/endpoint?style=flat&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2Fjavierbrea%2Fcypress-fail-fast%2Fmain)](https://dashboard.stryker-mutator.io/reports/github.com/javierbrea/cypress-fail-fast/main)

[![NPM dependencies][npm-dependencies-image]][npm-dependencies-url] [![Renovate](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com) [![Last commit][last-commit-image]][last-commit-url] [![Last release][release-image]][release-url]

[![NPM downloads][npm-downloads-image]][npm-downloads-url] [![License][license-image]][license-url]

# Cypress Fail Fast

Enables fail fast in Cypress, skipping the rest of tests on first failure.

## Installation

Add the plugin to `devDependencies`

```bash
npm i --save-dev cypress-fail-fast
```

Inside `cypress/plugins/index.js`:

```javascript
module.exports = (on, config) => {
  require("cypress-fail-fast/plugin")(on, config);
  return config;
};
```

At the top of `cypress/support/index.js`:

```javascript
import "cypress-fail-fast";
```

## Usage

Use the environment variable CYPRESS_FAIL_FAST to enable fail fast:

```bash
CYPRESS_FAIL_FAST=true npm run cypress
```

or Set the "env" key in your cypress.json configuration file:

```json
{
  "env":
  {
    "FAIL_FAST": true
  }
}
```

From now, if one test fail after its last retry, the rest of tests will be skipped:

![Cypress results screenshot](docs/assets/cypress-fail-fast-screenshot.png)

## Usage with TypeScript

If you are using [TypeScript in the Cypress plugins file][cypress-typescript], this plugin includes TypeScript declarations and can be imported like the following:

```ts
import cypressFailFast = require("cypress-fail-fast/plugin");

export default (on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions): Cypress.ResolvedConfigOptions => {
  cypressFailFast(on, config);
  return config;
};
```

## Tests

To ensure the plugin stability, it is being tested with Cypress major versions 5.x and 6.x, and new releases will be published for each new Cypress minor or major releases, updating the package E2E tests.

Latest versions used in the E2E tests can be checked in the `devDependencies` of the `package.json` files of the E2E tests at https://github.com/javierbrea/cypress-fail-fast/blob/main/test-e2e/cypress-5/package.json and https://github.com/javierbrea/cypress-fail-fast/blob/main/test-e2e/cypress-6/package.json

Anyway, if you find any issue for a specific Cypress version, please report it at https://github.com/javierbrea/cypress-fail-fast/issues.

## Acknowledgements

This plugin has been developed based on the solutions proposed by the community on this [Cypress issue](https://github.com/cypress-io/cypress/issues/518), so thanks to all! I hope this plugin can be deprecated soon, as soon as the Cypress team adds native support for this feature. 😃

## Contributing

Contributors are welcome.
Please read the [contributing guidelines](.github/CONTRIBUTING.md) and [code of conduct](.github/CODE_OF_CONDUCT.md).

## License

MIT, see [LICENSE](./LICENSE) for details.

[coveralls-image]: https://coveralls.io/repos/github/javierbrea/cypress-fail-fast/badge.svg
[coveralls-url]: https://coveralls.io/github/javierbrea/cypress-fail-fast
[build-image]: https://github.com/javierbrea/cypress-fail-fast/workflows/build/badge.svg?branch=main
[build-url]: https://github.com/javierbrea/cypress-fail-fast/actions?query=workflow%3Abuild+branch%3Amain
[last-commit-image]: https://img.shields.io/github/last-commit/javierbrea/cypress-fail-fast.svg
[last-commit-url]: https://github.com/javierbrea/cypress-fail-fast/commits
[license-image]: https://img.shields.io/npm/l/cypress-fail-fast.svg
[license-url]: https://github.com/javierbrea/cypress-fail-fast/blob/main/LICENSE
[npm-downloads-image]: https://img.shields.io/npm/dm/cypress-fail-fast.svg
[npm-downloads-url]: https://www.npmjs.com/package/cypress-fail-fast
[npm-dependencies-image]: https://img.shields.io/david/javierbrea/cypress-fail-fast.svg
[npm-dependencies-url]: https://david-dm.org/javierbrea/cypress-fail-fast
[quality-gate-image]: https://sonarcloud.io/api/project_badges/measure?project=cypress-fail-fast&metric=alert_status
[quality-gate-url]: https://sonarcloud.io/dashboard?id=cypress-fail-fast
[release-image]: https://img.shields.io/github/release-date/javierbrea/cypress-fail-fast.svg
[release-url]: https://github.com/javierbrea/cypress-fail-fast/releases

[cypress-typescript]: https://docs.cypress.io/guides/tooling/typescript-support.html
