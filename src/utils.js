const path = require("path");
const fs = require("fs");
const findPackageJSON = require("find-package-json");
const detectIndent = require("detect-indent");

const { VITE_COMMANDS } = require("./constants");

function getPackageJSON() {
  const iterator = findPackageJSON();
  const nextPackageJSON = iterator.next();

  if (nextPackageJSON && nextPackageJSON.filename) {
    const packageJSONContent = fs.readFileSync(
      nextPackageJSON.filename,
      "utf-8"
    );

    const packageJSON = JSON.parse(packageJSONContent);

    return {
      file: nextPackageJSON.filename,
      indent: detectIndent(packageJSONContent).indent || 4,
      json: packageJSON,
    };
  }

  return {
    file: `${process.cwd()}/package.json`,
    indent: 4,
    json: {},
  };
}

function getViteConfig() {
  return {
    content: `
    import { defineConfig } from 'vite'
    import react from '@vitejs/plugin-react'
      
    export default defineConfig({
        plugins: [react()]
      })`,
    dependencies: ["vite", "@vitejs/plugin-react"],
  };
}

function addViteScripts(packageJSON) {
  if (packageJSON) {
    return {
      ...packageJSON,
      scripts: {
        ...(packageJSON.scripts || {}),
        ...VITE_COMMANDS,
      },
    };
  }

  return {
    scripts: VITE_COMMANDS,
  };
}

module.exports = {
  getPackageJSON,
  addViteScripts,
  getViteConfig,
};
