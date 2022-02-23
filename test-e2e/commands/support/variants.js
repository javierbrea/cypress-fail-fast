const VARIANTS = [
  {
    name: "Cypress 5",
    path: "cypress-5",
    version: "5",
    typescript: false,
    skippable: true,
  },
  {
    name: "Cypress 6",
    path: "cypress-6",
    version: "6",
    typescript: false,
    skippable: true,
  },
  {
    name: "Cypress 7",
    path: "cypress-7",
    version: "7",
    typescript: false,
    skippable: true,
  },
  {
    name: "Cypress 8",
    path: "cypress-8",
    version: "8",
    typescript: false,
    skippable: false,
    pluginFile: "preprocessor-babel-config",
  },
  {
    name: "Cypress 9",
    path: "cypress-9",
    version: "9",
    isLatest: true,
    typescript: false,
    skippable: false,
    pluginFile: "preprocessor-babel-config",
  },
  {
    name: "TypeScript",
    path: "typescript",
    version: "ts",
    skippable: true,
    typescript: true,
  },
];

module.exports = VARIANTS;
