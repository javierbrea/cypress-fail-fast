# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [unreleased]
### Added
- feat: Read failFast.enabled property from current test and parents configuration
- test(e2e): Add helper to run E2E tests with different specs files and configurations
### Changed
### Fixed
### Removed
### BREAKING CHANGES

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
