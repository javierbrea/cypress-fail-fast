const VARIANTS = [
  {
    name: "Cypress 15",
    path: "cypress-15",
    version: "15",
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
