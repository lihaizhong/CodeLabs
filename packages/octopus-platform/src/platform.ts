import {
  PlatformGlobals,
  SupportedPlatform,
  PlatformPluginOptions,
  PlatformPluginProperty,
  Platform,
} from "./types";
import { noop, retry } from "./extensions";
import { version } from "../package.json";

export abstract class OctopusPlatform<P extends PlatformPluginProperty>
  implements Platform
{
  /**
   * 插件列表
   */
  private plugins: PlatformPluginOptions<P>[] = [];

  /**
   * 平台版本
   */
  public platformVersion: string = version;

  /**
   * 应用版本
   */
  public version: string = "";

  /**
   * 全局变量
   */
  public globals: PlatformGlobals = {
    env: "unknown",
    br: null,
    dpr: 1,
  };

  public noop = noop;

  public retry = retry;

  constructor(plugins: PlatformPluginOptions<P>[], version?: string) {
    this.version = version || "";
    this.plugins = plugins;
    this.globals.env = this.autoEnv();
  }

  protected init() {
    this.globals.br = this.useBridge();
    this.globals.dpr = this.usePixelRatio();

    const plugins: Record<P, PlatformPluginOptions<P>> = this.plugins.reduce(
      (acc, plugin) => {
        acc[plugin.name] = plugin;

        return acc;
      },
      {} as Record<P, PlatformPluginOptions<P>>
    );
    const pluginNames = this.plugins.map((plugin) => plugin.name);
    const installedPlugins: Record<string, boolean> = {};

    this.usePlugins(plugins, pluginNames, installedPlugins);
  }

  private autoEnv() {
    // FIXME：由于抖音场景支持wx对象，所以需要放在wx对象之前检查
    if (typeof window !== "undefined") {
      return "h5";
    }

    if (typeof tt !== "undefined") {
      return "tt";
    }

    if (typeof my !== "undefined") {
      return "alipay";
    }

    if (typeof wx !== "undefined") {
      return "weapp";
    }

    throw new Error("Unsupported app");
  }

  private useBridge() {
    switch (this.globals.env) {
      case "h5":
        return globalThis;
      case "alipay":
        return my;
      case "tt":
        return tt;
      case "weapp":
        return wx;
      default:
    }

    return {};
  }

  private usePixelRatio() {
    const { env, br } = this.globals;

    if (env === "h5") {
      return devicePixelRatio;
    }

    if ("getWindowInfo" in br) {
      return (br as any).getWindowInfo().pixelRatio;
    }

    if ("getSystemInfoSync" in br) {
      return (br as WechatMiniprogram.Wx).getSystemInfoSync().pixelRatio;
    }

    return 1;
  }

  private usePlugins(
    plugins: Record<P, PlatformPluginOptions<P>>,
    pluginNames: string[],
    installedPlugins: Record<string, boolean>
  ) {
    pluginNames.forEach((pluginName) => {
      const plugin = plugins[pluginName as P];

      if (installedPlugins[pluginName]) {
        return;
      }

      if (plugin === undefined) {
        throw new Error(`Plugin ${pluginName} not found`);
      }

      if (Array.isArray(plugin.dependencies)) {
        for (const dependency of plugin.dependencies) {
          if (typeof plugins[dependency as P]?.install !== "function") {
            throw new Error(
              `Plugin ${pluginName} depends on plugin ${dependency}, but ${dependency} is not found`
            );
          }
        }

        this.usePlugins(plugins, plugin.dependencies, installedPlugins);
      }

      this.installPlugin(plugin);
      installedPlugins[plugin.name] = true;
    });
  }

  abstract installPlugin(plugin: PlatformPluginOptions<P>): void;

  public switch(env: SupportedPlatform) {
    this.globals.env = env;
    this.init();
  }
}
