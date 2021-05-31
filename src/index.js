const { fdir } = require("fdir");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { Parser } = require("acorn");
const chalk = require("chalk");
const JSXParser = Parser.extend(require("acorn-jsx")());
const { getPackageJSON, addViteScripts, getViteConfig } = require("./utils");

const EXCLUDED_FOLDERS = ["node_modules", "cypress"];

console.log(chalk.grey("🕵️  Scanning js files..."));

const files = new fdir()
  .withBasePath()
  .withFullPaths()
  .exclude((dirName) => EXCLUDED_FOLDERS.includes(dirName))
  .glob("./**/*.js")
  .filter((path) => !(path.endsWith(".test.js") || path.endsWith(".spec.js")))
  .crawl(".")
  .sync();

console.log(chalk.magentaBright(`🔦 Scanned ${files.length} files`));

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
    console.log(chalk.red(`🧨 Error in ${filePath}: ${e.message}`));
  }
});

if (reactFilesConverted) {
  console.log(chalk.green(`✅ Converted ${reactFilesConverted} files`));
}

/** Update package json and create vite config */
console.log(chalk.grey("⚙️  Adding vite scripts and config to project"));

const packageInfo = getPackageJSON();
const rootDirectory = path.dirname(packageInfo.file);

const packageJSONWithViteScripts = addViteScripts(packageInfo.json);
fs.writeFileSync(
  packageInfo.file,
  JSON.stringify(packageJSONWithViteScripts, null, packageInfo.indent),
  {
    encoding: "utf-8",
  }
);

const isReact17 = packageInfo.json.dependencies.react
  .split(".")[0]
  .includes("17");

const viteConfig = getViteConfig(isReact17);
fs.writeFileSync(
  `${rootDirectory}/vite.config.js`,
  viteConfig.content,
  "utf-8"
);

console.log(chalk.green("⚡️ Created config file for vite"));

/** Update and move index html */
console.log(chalk.grey("📄 Moving & updating index.html to root"));

const newHTMLPath = `${rootDirectory}/index.html`;
fs.renameSync(`${rootDirectory}/public/index.html`, newHTMLPath);

const htmlContent = fs.readFileSync(newHTMLPath, "utf-8");
fs.writeFileSync(newHTMLPath, htmlContent.replace(/%PUBLIC_URL%/g, ""));


/** Install Deps */
const yarnLockExists = fs.existsSync(`${rootDirectory}/yarn.lock`);

let installCommand = ""

if (yarnLockExists) {
  installCommand = `yarn add ${viteConfig.dependencies.join(" ")} --dev`
} else {
  installCommand = `npm install ${viteConfig.dependencies.join(" ")} --save-dev`;
}

console.log(chalk.grey("📥 Installing dependencies"))

exec(installCommand, (err, stdout, stderr) => {
  if (err) {
    console.log(chalk.redBright("🚨 Error while installing deps: ", err))
    return;
  }

  console.log(chalk.green(`Deps Installer: ${stdout}`));
  console.log(chalk.yellow(`Deps Installer: ${stderr}`));
});

console.log(
  chalk.yellowBright("NOTE:"),
  chalk.yellow(
    `Add <script type="module" src="YOUR_ENTRY_FILE"></script> to index.html`
  )
);