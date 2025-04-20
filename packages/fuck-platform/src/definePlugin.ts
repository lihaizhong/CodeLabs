import { PlatformPlugin } from "fuck-platform";

export const definePlugin = <T extends string, R>(
  plugin: PlatformPlugin<T, R>
) => plugin;
