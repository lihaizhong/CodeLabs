import { PlatformPluginInstance } from "fuck-platform";

export const definePlugin = <T extends string, R>(
  plugin: PlatformPluginInstance<T, R>
) => plugin;
