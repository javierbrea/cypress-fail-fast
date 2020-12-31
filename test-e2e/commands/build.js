const { copyPluginToCypressSupport, copyCypressSources } = require("./support/copy");

const VARIANTS = [
  {
    path: "cypress-5",
    typescript: false,
  },
  {
    path: "cypress-6",
    typescript: false,
  },
  {
    path: "typescript",
    typescript: true,
  },
];

VARIANTS.forEach((variant) => {
  copyCypressSources(variant.path, variant.typescript);
  if (variant.typescript) {
    copyPluginToCypressSupport(variant.path);
  }
});
