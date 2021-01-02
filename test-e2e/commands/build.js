const { copyPluginToCypressSupport, copyCypressSources } = require("./support/copy");

const variants = require("./support/variants");

variants.forEach((variant) => {
  copyCypressSources(variant.path, variant.typescript);
  if (variant.typescript) {
    copyPluginToCypressSupport(variant.path);
  }
});
