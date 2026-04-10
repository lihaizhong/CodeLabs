#!/usr/bin/env zx

import "zx/globals";

const workspacePatterns = ["experiments/*", "mp-platform/*", "packages/*"];
const patterns = workspacePatterns.map((pattern) => pattern + "/node_modules");
const packageGarbages = await glob(patterns, {
  onlyDirectories: true,
  deep: 3,
});
const workspaceGarbage = ["node_modules", "dist", ".parcel-cache"];
const cleanup = (dirtyPath) => fs.removeSync(path.resolve(dirtyPath));

await spinner(chalk.green("Cleaning up workspace..."), async () => {
  workspaceGarbage.forEach(cleanup);
  packageGarbages.forEach(cleanup);

  await $`bun install --force`;
});

console.log(chalk.green("Cleaned up workspace!"));