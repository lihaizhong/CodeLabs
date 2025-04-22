import { PlatformPluginProperty, PlatformPluginOptions } from "./types";

export const definePlugin = <T extends PlatformPluginProperty>(
  plugin: PlatformPluginOptions<T>
) => plugin;
