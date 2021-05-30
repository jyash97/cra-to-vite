const path = require("path");
const fs = require("fs");
const findPackageJSON = require("find-package-json");
const detectIndent = require("detect-indent");

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
      path: path.dirname(nextPackageJSON.filename),
    };
  }

  return null;
}

module.exports = {
  getPackageJSON,
};
