const VARIANTS = [
  {
    name: "Cypress 5",
    path: "cypress-5",
    typescript: false,
    skippable: true,
  },
  {
    name: "Cypress 6",
    path: "cypress-6",
    typescript: false,
    skippable: true,
  },
  {
    name: "Cypress 7",
    path: "cypress-7",
    typescript: false,
  },
  {
    name: "Cypress 8",
    path: "cypress-8",
    typescript: false,
    pluginFile: "preprocessor-babel-config",
  },
  {
    name: "Cypress 9",
    path: "cypress-9",
    typescript: false,
    pluginFile: "preprocessor-babel-config",
  },
  {
    name: "TypeScript",
    path: "typescript",
    typescript: true,
    skippable: true,
  },
];

module.exports = VARIANTS;
