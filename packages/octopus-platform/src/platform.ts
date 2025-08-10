import { noop, retry } from "./extensions";
import type { OctopusPlatformPluginOptions } from "./definePlugin";
import type { OctopusPlatformPlugins } from "./typings";

export type OctopusSupportedPlatform =
  | "weapp"
  | "alipay"
  | "tt"
  | "h5"
  | "harmony"
  | "unknown";

export interface OctopusPlatformGlobals {
  env: OctopusSupportedPlatform;
  br: any;
  dpr: number;
}

export type OctopusPlatformWithDependencies<
  N extends keyof OctopusPlatformPlugins,
  D extends keyof OctopusPlatformPlugins = never
> = OctopusPlatform<N> & {
  [K in D]: OctopusPlatformPlugins[K];
};

export abstract class OctopusPlatform<
  N extends keyof OctopusPlatformPlugins
> {
  /**
   * 插件列表
   */
  private plugins: OctopusPlatformPluginOptions<N, N>[] = [];

  /**
   * 平台版本
   */
  public platformVersion: string = __VERSION__;

  /**
   * 应用版本
   */
  public version: string = "";

  /**
   * 全局变量
   */
  public globals: OctopusPlatformGlobals = {
    env: "unknown",
    br: null,
    dpr: 1,
  };

  public noop = noop;

  public retry = retry;

  constructor(plugins: OctopusPlatformPluginOptions<N, N>[], version?: string) {
    this.version = version || "";
    this.plugins = plugins;
    this.globals.env = this.autoEnv();
  }

  protected init(): void {
    const { globals, plugins } = this;
    const collection: Map<N, OctopusPlatformPluginOptions<N, N>> = new Map();
    const names: N[] = [];
    const installedPlugins: Set<N> = new Set();

    globals.br = this.useBridge();
    globals.dpr = this.usePixelRatio();

    for (const plugin of plugins) {
      names.push(plugin.name);
      collection.set(plugin.name, plugin);
    }

    this.usePlugins(collection, names, installedPlugins);
    installedPlugins.clear();
  }

  private autoEnv(): OctopusSupportedPlatform | never {
    if (typeof window !== "undefined") {
      return "h5";
    }

    // FIXME：由于抖音场景支持wx对象，所以需要放在wx对象之前检查
    if (typeof tt !== "undefined") {
      return "tt";
    }

    if (typeof my !== "undefined") {
      return "alipay";
    }

    if (typeof wx !== "undefined") {
      return "weapp";
    }

    if (typeof has !== "undefined") {
      return "harmony";
    }

    throw new Error("Unsupported platform！");
  }

  private useBridge() {
    switch (this.globals.env) {
      case "alipay":
        return my;
      case "tt":
        return tt;
      case "weapp":
        return wx;
      default:
    }

    return globalThis;
  }

  private usePixelRatio(): number {
    const { env, br } = this.globals;

    if (env === "h5") {
      return devicePixelRatio;
    }

    if ("getWindowInfo" in br) {
      return (br as any).getWindowInfo().pixelRatio;
    }

    if ("getSystemInfoSync" in br) {
      return br.getSystemInfoSync().pixelRatio;
    }

    return 1;
  }

  private useSystem() {
    const { env } = this.globals;
    let system: string;

    switch (env) {
      case "weapp":
        system = wx.getDeviceInfo().platform as string;
        break;
      case "alipay":
        system = my.getDeviceBaseInfo().platform as string;
        break;
      case "tt":
        system = tt.getDeviceInfoSync().platform as string;
        break;
      case "harmony":
        system = has.getSystemInfoSync().platform as string;
        break;
      default:
        system = "unknown";
    }

    return system.toLowerCase();
  }

  private usePlugins(
    plugins: Map<N, OctopusPlatformPluginOptions<N, N>>,
    pluginNames: N[],
    installedPlugins: Set<N>
  ): void {
    for (const pluginName of pluginNames) {
      if (!plugins.has(pluginName)) {
        throw new Error(`Plugin ${pluginName} not found`);
      }

      if (installedPlugins.has(pluginName)) {
        return;
      }

      const plugin = plugins.get(pluginName) as OctopusPlatformPluginOptions<N, N>;

      // 递归调用依赖
      if (Array.isArray(plugin.dependencies)) {
        for (const dependency of plugin.dependencies) {
          if (typeof plugins.get(dependency)?.install !== "function") {
            throw new Error(
              `Plugin ${pluginName} depends on plugin ${dependency}, but ${dependency} is not found`
            );
          }
        }

        // 递归加载依赖
        this.usePlugins(plugins, plugin.dependencies, installedPlugins);
      }

      this.installPlugin(plugin);
      installedPlugins.add(pluginName);
    }
  }

  abstract installPlugin(plugin: OctopusPlatformPluginOptions<N, N>): void;

  public switch(env: OctopusSupportedPlatform): void {
    this.globals.env = env;
    this.init();
  }
}
