const VARIANTS = [
  {
    name: "Cypress 9",
    path: "cypress-9",
    version: "9",
    typescript: false,
    skippable: true,
    pluginFile: "preprocessor-babel-config",
    copyPlugin: true,
  },
  {
    name: "Cypress 10",
    path: "cypress-10",
    version: "10",
    isLatest: false,
    typescript: false,
    skippable: true,
    configFile: "cypress.config.js",
    supportFile: "e2e.js",
    copyPlugin: false,
  },
  {
    name: "Cypress 11",
    path: "cypress-11",
    version: "11",
    isLatest: false,
    typescript: false,
    skippable: true,
    configFile: "cypress.config.js",
    supportFile: "e2e.js",
    copyPlugin: false,
  },
  {
    name: "Cypress 12",
    path: "cypress-12",
    version: "12",
    isLatest: false,
    typescript: false,
    skippable: false,
    configFile: "cypress.config.js",
    supportFile: "e2e.js",
    copyPlugin: false,
  },
  {
    name: "Cypress 13",
    path: "cypress-13",
    version: "13",
    isLatest: true,
    typescript: false,
    skippable: false,
    configFile: "cypress.config.js",
    supportFile: "e2e.js",
    copyPlugin: false,
  },
  {
    name: "TypeScript",
    path: "typescript",
    version: "ts",
    skippable: true,
    configFile: "cypress.config.ts",
    supportFile: "e2e.ts",
    typescript: true,
    copyPlugin: false,
  },
];

module.exports = VARIANTS;
