// TODO, use typescript paths alias to load directly library from parent folder instead of copying it

const path = require("path");
const fsExtra = require("fs-extra");

const rootPath = path.resolve(__dirname, "..");
const rootLibPath = path.resolve(rootPath, "..", "..");
const destPath = path.resolve(rootPath, "cypress", "support", "cypress-fail-fast");

const SRC_FOLDER = "src";
const INDEX_FILE = "index.js";
const INDEX_TYPE_FILE = "index.d.ts";
const PLUGIN_FILE = "plugin.js";
const PLUGIN_TYPE_FILE = "plugin.d.ts";
const ESLINT_FILE = ".eslintrc.json";

const libPath = path.resolve(rootLibPath, SRC_FOLDER);
const indexFile = path.resolve(rootLibPath, INDEX_FILE);
const indexTypeFile = path.resolve(rootLibPath, INDEX_TYPE_FILE);
const pluginFile = path.resolve(rootLibPath, PLUGIN_FILE);
const pluginTypeFile = path.resolve(rootLibPath, PLUGIN_TYPE_FILE);
const eslintFile = path.resolve(rootPath, ESLINT_FILE);

const copyLib = () => {
  fsExtra.removeSync(destPath);
  fsExtra.ensureDirSync(destPath);
  fsExtra.copySync(libPath, path.resolve(destPath, SRC_FOLDER));
  fsExtra.copySync(indexFile, path.resolve(destPath, INDEX_FILE));
  fsExtra.copySync(indexTypeFile, path.resolve(destPath, INDEX_TYPE_FILE));
  fsExtra.copySync(pluginFile, path.resolve(destPath, PLUGIN_FILE));
  fsExtra.copySync(pluginTypeFile, path.resolve(destPath, PLUGIN_TYPE_FILE));
  fsExtra.copySync(eslintFile, path.resolve(destPath, ESLINT_FILE));
};

copyLib();
