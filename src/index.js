const { fdir } = require("fdir");
const fs = require("fs");
const { Parser } = require("acorn");
const chalk = require("chalk");
const JSXParser = Parser.extend(require("acorn-jsx")());
const { getPackageJSON } = require("./utils");

const EXCLUDED_FOLDERS = ["node_modules", "cypress"];

const files = new fdir()
  .withBasePath()
  .withFullPaths()
  .exclude((dirName) => EXCLUDED_FOLDERS.includes(dirName))
  .glob("./**/*.js")
  .filter((path) => !(path.endsWith(".test.js") || path.endsWith(".spec.js")))
  .crawl(".")
  .sync();

chalk.yellowBright(`Scanned ${files.length} files`);

let reactFilesConverted = 0;

files.forEach((filePath) => {
  const fileContent = fs.readFileSync(filePath, "utf-8");

  try {
    if (
      fileContent.includes("extends React.Component") ||
      fileContent.includes("extends Component")
    ) {
      reactFilesConverted++;
      fs.renameSync(filePath, `${filePath}x`);
    } else {
      const isReactComponent = Boolean(
        JSON.stringify(
          JSXParser.parse(fileContent, {
            sourceType: "module",
            ecmaVersion: "latest",
          })
        ).includes("JSXIdentifier")
      );

      if (isReactComponent) {
        reactFilesConverted++;
        fs.renameSync(filePath, `${filePath}x`);
      }
    }
  } catch (e) {
    chalk.red(`🧨 Error in ${filePath}: ${e.message}`);
  }
});

if (reactFilesConverted) {
  chalk.green(`✅ Converted ${reactFilesConverted} files`);
}

const packageInfo = getPackageJSON();

if (packageInfo) {
  const updatedPackage = {
    ...packageInfo.json,
    scripts: {
      ...(packageInfo.json.scripts || {}),
      "vite:start": "vite",
      "vite:build": "vite build",
    },
  };

  fs.writeFileSync(
    `${packageInfo.path}/package.json`,
    JSON.stringify(updatedPackage, null, packageInfo.indent),
    {
      encoding: "utf-8",
    }
  );

  chalk.green("🏁 Added vite scripts in package json");
}

chalk.blue("Creating vite config...");

fs.writeFileSync(
  `${process.cwd()}/vite.config.js`,
  `import reactRefresh from '@vitejs/plugin-react-refresh'

export default {
  plugins: [reactRefresh()]
}`,
  "utf-8"
);

chalk.green("✅ Create config file for vite");

chalk.grey("ℹ️ Copy and run below script:");

chalk.brightBlue("yarn add vite @vitejs/plugin-react-refresh");
