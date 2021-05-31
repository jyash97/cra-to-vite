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
    json: {}
  };
}

function getViteConfig(isReact17) {
  if (isReact17) {
    return {
      content: `import reactJsx from 'vite-react-jsx'

export default {
  plugins: [
    reactJsx(),
  ]
}`,
      dependencies: ["vite", "vite-react-jsx"],
    };
  }

  return {
    content: `import reactRefresh from '@vitejs/plugin-react-refresh'

export default {
  plugins: [reactRefresh()]
}`,
    dependencies: ["vite", "@vitejs/plugin-react-refresh"],
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
  getViteConfig
};
