const { copyPluginToCypressSupport, copyCypressSources, copyScripts } = require("./support/copy");

const variants = require("./support/variants");

variants.forEach((variant) => {
  copyScripts(variant.path);
  copyCypressSources(variant);
  if (variant.typescript) {
    copyPluginToCypressSupport(variant.path);
  }
});
