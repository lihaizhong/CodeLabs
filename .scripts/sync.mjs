#!/usr/bin/env zx

import 'zx/globals';

const { sync } = await fs.readJson('./snippets.config.json');
const packages = await glob(['packages/*/package.json']);
const mpPackages = await glob(['mp-platform/*/package.json']);

function getTargetDir(packageName) {
  for (const pkgPath of mpPackages) {
    const { name } = fs.readJsonSync(pkgPath);

    if (name === packageName) {
      return path.resolve(pkgPath, '..');
    }
  }
}

function copyToTarget(dependencies, targetDir) {
  Object.entries(dependencies).forEach(([dependenceName, filepath]) => {
    for (const pkgPath of packages) {
      const { name, main } = fs.readJsonSync(pkgPath);

      if (name === dependenceName) {
        const sourcePath = path.resolve(pkgPath, '..', main);
        const targetPath = path.resolve(targetDir, filepath);

        fs.copySync(sourcePath, targetPath);
        console.log(
          chalk.green(`copy ${dependenceName} to ${targetPath} success`)
        );
        break;
      }
    }
  });
}

Object.keys(sync).forEach((packageName) => {
  const { dependencies } = sync[packageName];

  if (!dependencies) return;

  const targetDir = getTargetDir(packageName);

  copyToTarget(dependencies, targetDir);
});
