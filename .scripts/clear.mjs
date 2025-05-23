#!/usr/bin/env zx

import "zx/globals";

const yamlProfile = fs.readFileSync("./pnpm-workspace.yaml", {
  encoding: "utf8",
});
const profile = YAML.parse(yamlProfile);
const patterns = profile.packages.map((pattern) => pattern + "/node_modules");
const packageGarbages = await glob(patterns, {
  onlyDirectories: true,
  deep: 3,
});
const workspaceGarbage = ["node_modules", "dist", ".parcel-cache"];
const cleanup = (dirtyPath) => fs.removeSync(path.resolve(dirtyPath));

await spinner(chalk.green("Cleaning up workspace..."), async () => {
  workspaceGarbage.forEach(cleanup);
  packageGarbages.forEach(cleanup);

  await $`pnpm store prune`;
  await $`pnpm prune`;
});

console.log(chalk.green("Cleaned up workspace!"));
