# cra-to-vite ⚡️ 

## Motivation
I wanted fast development workflow in create react app and `Vite` seems to solve the issue.

`Vite` expects react components filename to have extension `jsx` which can be time consuming to do manually. I created this tool to automatically convert `.js` files to `.jsx`, adds all dependencies and config file.

## Usage
**`Note:` This still experimental, do backup the files in case something goes wrong**

```
npx cra-to-vite
```

## Features Supported
- Adds config based on react version
- Add dev dependencies
- File conversion
- Moving html to root
- Absolute path support ( Coming soon )

## Performance
Converted `~140` files in less than a minute.
