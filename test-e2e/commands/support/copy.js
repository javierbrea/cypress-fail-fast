const path = require("path");
const fsExtra = require("fs-extra");

const CYPRESS_PATH = "cypress";
const CYPRESS_PLUGINS_PATH = "plugins";
const CYPRESS_CUSTOM_PLUGINS_PATH = "plugins-custom";
const CYPRESS_SUPPORT_PATH = "support";
const CYPRESS_INTEGRATION_PATH = "integration";
const TESTS_PATH = path.resolve(__dirname, "..", "..");
const ROOT_LIB_PATH = path.resolve(TESTS_PATH, "..");
const VARIANTS_PATH = path.resolve(TESTS_PATH, "cypress-variants");
const CYPRESS_SRC_PATH = path.resolve(TESTS_PATH, "cypress-src");

const toTypeScriptName = (fileName, hasToBeRenamed) => {
  return hasToBeRenamed ? fileName.replace(".js", ".ts") : fileName;
};

const variantPaths = (variant) => {
  const rootPath = path.resolve(VARIANTS_PATH, variant);
  return {
    root: rootPath,
    cypress: {
      integration: path.resolve(rootPath, CYPRESS_PATH, CYPRESS_INTEGRATION_PATH),
      support: path.resolve(rootPath, CYPRESS_PATH, CYPRESS_SUPPORT_PATH),
      plugins: path.resolve(rootPath, CYPRESS_PATH, CYPRESS_PLUGINS_PATH),
    },
  };
};

const copyScripts = (variant) => {
  const SCRIPTS_FOLDER = "scripts";
  const destPaths = variantPaths(variant);
  const scriptsDestFolder = path.resolve(destPaths.root, SCRIPTS_FOLDER);
  const scriptsOriginFolder = path.resolve(CYPRESS_SRC_PATH, SCRIPTS_FOLDER);

  fsExtra.removeSync(scriptsDestFolder);
  fsExtra.copySync(scriptsOriginFolder, scriptsDestFolder);
};

const copyPluginToCypressSupport = (variant) => {
  const PLUGIN_DEST_FOLDER = "cypress-fail-fast";
  const SRC_FOLDER = "src";
  const INDEX_FILE = "index.js";
  const INDEX_TYPE_FILE = "index.d.ts";
  const PLUGIN_FILE = "plugin.js";
  const PLUGIN_TYPE_FILE = "plugin.d.ts";
  const ESLINT_FILE = ".eslintrc.json";

  const libPath = path.resolve(ROOT_LIB_PATH, SRC_FOLDER);
  const indexFile = path.resolve(ROOT_LIB_PATH, INDEX_FILE);
  const indexTypeFile = path.resolve(ROOT_LIB_PATH, INDEX_TYPE_FILE);
  const pluginFile = path.resolve(ROOT_LIB_PATH, PLUGIN_FILE);
  const pluginTypeFile = path.resolve(ROOT_LIB_PATH, PLUGIN_TYPE_FILE);
  const eslintFile = path.resolve(ROOT_LIB_PATH, ESLINT_FILE);

  const destPaths = variantPaths(variant);
  const pluginDestFolder = path.resolve(destPaths.cypress.support, PLUGIN_DEST_FOLDER);

  fsExtra.removeSync(pluginDestFolder);
  fsExtra.ensureDirSync(pluginDestFolder);
  fsExtra.copySync(libPath, path.resolve(pluginDestFolder, SRC_FOLDER));
  fsExtra.copySync(indexFile, path.resolve(pluginDestFolder, INDEX_FILE));
  fsExtra.copySync(indexTypeFile, path.resolve(pluginDestFolder, INDEX_TYPE_FILE));
  fsExtra.copySync(pluginFile, path.resolve(pluginDestFolder, PLUGIN_FILE));
  fsExtra.copySync(pluginTypeFile, path.resolve(pluginDestFolder, PLUGIN_TYPE_FILE));
  fsExtra.copySync(eslintFile, path.resolve(pluginDestFolder, ESLINT_FILE));
};

const copyCypressPluginFile = (variant, typescript = false, customPluginFolder = null) => {
  const destPaths = variantPaths(variant);
  const INDEX_FILE = toTypeScriptName("index.js", typescript);

  const pluginsPath = path.resolve(CYPRESS_SRC_PATH, CYPRESS_PLUGINS_PATH);
  const customPluginsPath = path.resolve(CYPRESS_SRC_PATH, CYPRESS_CUSTOM_PLUGINS_PATH);
  const pluginFile = customPluginFolder
    ? path.resolve(customPluginsPath, customPluginFolder, INDEX_FILE)
    : path.resolve(pluginsPath, INDEX_FILE);

  fsExtra.removeSync(destPaths.cypress.plugins);
  fsExtra.ensureDirSync(destPaths.cypress.plugins);
  fsExtra.copySync(pluginFile, path.resolve(destPaths.cypress.plugins, INDEX_FILE));
};

const copyCypressConfigFile = (variantPath, configFileName, destConfigFileName) => {
  const destPaths = variantPaths(variantPath);
  const pluginFile = path.resolve(CYPRESS_SRC_PATH, configFileName);
  fsExtra.copySync(pluginFile, path.resolve(destPaths.root, destConfigFileName || configFileName));
};

const removeCypressConfigFile = (variantPath, configFileName) => {
  const destPaths = variantPaths(variantPath);
  fsExtra.removeSync(path.resolve(destPaths.root, configFileName));
};

const copyCypressSources = (variant) => {
  const destPaths = variantPaths(variant.path);
  const BABEL_CONFIG_FILE = "babel.config.js";
  const CYPRESS_CONFIG_FILE = "cypress.json";
  const INDEX_FILE = toTypeScriptName("index.js", variant.typescript);

  const supportPath = path.resolve(CYPRESS_SRC_PATH, CYPRESS_SUPPORT_PATH);

  const cypressConfigFile = path.resolve(
    CYPRESS_SRC_PATH,
    variant.configFile || CYPRESS_CONFIG_FILE,
  );
  const babelConfigFile = path.resolve(CYPRESS_SRC_PATH, BABEL_CONFIG_FILE);
  const supportFile = path.resolve(supportPath, variant.supportFile || INDEX_FILE);

  fsExtra.removeSync(destPaths.cypress.plugins);
  if (variant.copyPlugin) {
    fsExtra.ensureDirSync(destPaths.cypress.plugins);
  }

  fsExtra.removeSync(destPaths.cypress.support);
  fsExtra.ensureDirSync(destPaths.cypress.support);
  fsExtra.copySync(
    supportFile,
    path.resolve(destPaths.cypress.support, variant.supportFile || INDEX_FILE),
  );

  fsExtra.copySync(
    cypressConfigFile,
    path.resolve(destPaths.root, variant.configFile || CYPRESS_CONFIG_FILE),
  );

  if (!variant.typescript) {
    fsExtra.copySync(babelConfigFile, path.resolve(destPaths.root, BABEL_CONFIG_FILE));
  }

  if (variant.copyPlugin) {
    copyCypressPluginFile(variant.path, variant.typescript);
  }
};

const copyCypressSpecs = (specsFolder, variant) => {
  const destPaths = variantPaths(variant.path);
  const INTEGRATION_A_FILE = "a-file.js";
  const INTEGRATION_B_FILE = "b-file.js";
  const INTEGRATION_C_FILE = "c-file.js";
  const INTEGRATION_D_FILE = "d-file.js";

  const integrationPath = path.resolve(CYPRESS_SRC_PATH, CYPRESS_INTEGRATION_PATH, specsFolder);

  const integrationAFile = path.resolve(integrationPath, INTEGRATION_A_FILE);
  const integrationBFile = path.resolve(integrationPath, INTEGRATION_B_FILE);
  const integrationCFile = path.resolve(integrationPath, INTEGRATION_C_FILE);
  const integrationDFile = path.resolve(integrationPath, INTEGRATION_D_FILE);

  fsExtra.removeSync(destPaths.cypress.integration);
  fsExtra.ensureDirSync(destPaths.cypress.integration);
  fsExtra.copySync(
    integrationAFile,
    path.resolve(
      destPaths.cypress.integration,
      toTypeScriptName(INTEGRATION_A_FILE, variant.typescript),
    ),
  );
  fsExtra.copySync(
    integrationBFile,
    path.resolve(
      destPaths.cypress.integration,
      toTypeScriptName(INTEGRATION_B_FILE, variant.typescript),
    ),
  );
  fsExtra.copySync(
    integrationCFile,
    path.resolve(
      destPaths.cypress.integration,
      toTypeScriptName(INTEGRATION_C_FILE, variant.typescript),
    ),
  );
  if (fsExtra.existsSync(integrationDFile)) {
    fsExtra.copySync(
      integrationDFile,
      path.resolve(
        destPaths.cypress.integration,
        toTypeScriptName(INTEGRATION_D_FILE, variant.typescript),
      ),
    );
  }
};

module.exports = {
  copyPluginToCypressSupport,
  copyCypressSources,
  copyCypressSpecs,
  copyCypressConfigFile,
  copyCypressPluginFile,
  copyScripts,
  removeCypressConfigFile,
};
