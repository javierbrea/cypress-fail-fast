const { copyPluginToCypressSupport, copyCypressSources, copyScripts } = require("./support/copy");

const variants = require("./support/variants");

variants.forEach((variant) => {
  copyScripts(variant.path);
  copyCypressSources(variant.path, variant.typescript);
  if (variant.typescript) {
    copyPluginToCypressSupport(variant.path);
  }
});
