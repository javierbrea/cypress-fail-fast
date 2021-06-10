# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [unreleased]
### Added
### Changed
### Fixed
### Removed
### BREAKING CHANGES

## [2.4.0] - 2021-06-10

### Added
- feat(#91): Enter skip mode if any hook fails

### Changed
- chore(deps): Update devDependencies

## [2.3.3] - 2021-05-29

### Changed
- chore(deps): Update devDependencies
- chore: Migrate Sonar project

## [2.3.2] - 2021-04-28

### Added
- chore(deps): Support Node v16.x in engines. Run tests also in node 16.0.0

### Changed
- chore(deps): Update devDependencies

## [2.3.1] - 2021-04-07

### Added
- chore(deps): Support Cypress v7.x in peerDependencies
- test(e2e): Run e2e tests also in Cypress v7.x

### Changed
- chore(pipelines): Update node versions
- chore(pipelines): Do not run tests in Node 10, because it is not supported by Cypress v7.x
- chore(deps): Update devDependencies
- chore(renovate): Configure renovate to not update Cypress to a version higher than 6.x in Cypress 6.x e2e tests folder
- test(e2e): Do not trace npm commands logs until DEBUG environment variable is set to true

## [2.3.0] - 2021-04-04

### Added
- feat: Add FAIL_FAST_STRATEGY environment variable, allowing to skip tests only in current spec file, in current run or in parallel runs (#29)
- feat: Add configuration allowing to implement fail-fast in parallel runs (#33).

### Changed
- chore(ci): Separate test mutation job to a new workflow
- chore(deps): Update devDependencies

## [2.2.2] - 2021-03-30

### Fixed
- fix: Fix configuration by test in Cypress versions higher than 6.6 (#73)

### Changed
- chore(deps): Update devDependencies

## [2.2.1] - 2021-03-24

### Fixed
- fix(ts): Make failFast property optional in test configuration (#69)
- docs: Fix typo in readme

### Changed
- chore(deps): Update devDependencies

## [2.2.0] - 2021-02-21

### Added
- test(e2e): Check that `test:after:run` event is executed in failed tests using mochawesome reporter (closes #61)
- feat: Stop Cypress runner in before hook in headless mode when tests should be skipped (closes #52)

### Fixed
- fix: Mark current test as pending when it has to be skipped (related to #61)

## [2.1.1] - 2021-02-21

### Changed
- chore(deps): Configure renovate to no upgrade Cypress version in v5 e2e tests

### Fixed
- fix: Revert change producing unstability (#61).

### Removed
- chore(deps): Remove unused devDependency

## [2.1.0] - 2021-02-21

### Added
- test(e2e): Check that `test:after:run` event is executed in failed tests.

### Changed
- feat: Do not stop runner from failed test hook and execute flag task "parallely" in order to let execute test:after:run events. (closes #61)
- test(e2e): Update Cypress 6 to latest version.
- chore(deps): Update devDependencies

### Removed
- test(unit): Remove duplicated test

## [2.0.0] - 2021-01-17

### Added
- feat: Add FAIL_FAST_ENABLED environment variable (#53)
- feat: Allow environment variables to be enabled with 1, and disabled with 0

### Changed
- feat: Rename FAIL_FAST environment variable to FAIL_FAST_PLUGIN (#53)
- test(e2e): Allow some tests to be executed only in last Cypress version in order to reduce timings
- chore(deps): Update devDependencies

### BREAKING CHANGES
- feat: Plugin is now enabled by default (#44). To disable it, FAIL_FAST_PLUGIN environment variable has to be explicitly set as "false". Removed FAIL_FAST environment variable, which now has not any effect.

## [1.4.0] - 2021-01-02

### Added
- feat: Add suite and tests plugin custom configuration. Enable or disable plugin for suites or tests using the enabled property from custom config
- test(e2e): Add helper to run E2E tests with different specs files and configurations

### Changed
- feat: Do not log plugin tasks, except when setting shouldSkip flag to true
- docs: Change TypeScript example
- refactor: Do not check plugin configuration inside Node.js plugin
- refactor: Rename plugin tasks. Start all with same namespace

### Removed
- chore: Remove unused eslint settings from src folder

## [1.3.1] - 2020-12-31
### Fixed
- docs: Fix E2E tests versions links

## [1.3.0] - 2020-12-31
### Added
- feat: Add TypeScript declarations (#37)
- test(e2e): Add E2E tests using TypeScript in Cypress

### Changed
- test(e2e): Refactor E2E tests to avoid code duplications. Now there is a common tests runner and code is generated for each different Cypress variant (except package.json files in order to allow renovate continue updating dependencies)
- docs: Update contributing guidelines
- chore(deps): Update dependencies

## [1.2.1] - 2020-12-10
### Fixed
- docs(badge): Fix build badge

## [1.2.0] - 2020-12-10
### Added
- chore(deps): Add node 10.x support

### Changed
- docs(readme): Improve docs
- chore(deps): Update Cypress 6.x version used in E2E
- chore(pipeline): Migrate pipelines to Github actions

## [1.1.0] - 2020-11-28
### Added
- test(deps): Add support for Cypress v6.x

### Fixed
- docs(readme): Fix installation instructions

## [1.0.0] - 2020-11-28
### Added
- First release
