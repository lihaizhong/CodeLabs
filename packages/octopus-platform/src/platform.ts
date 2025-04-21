import { PlatformGlobal, SupportedPlatform, PlatformPluginOptions, PlatformPluginProperty, PlatformPluginValue, Platform } from "./types";
import { noop, retry } from "./extensions";
import { version } from "../package.json";

export class OctopusPlatform<P extends PlatformPluginProperty> implements Platform<P> {
  private plugins: PlatformPluginOptions<P>[] = [];

  public platformVersion: string = version;

  public version: string = "";

  public global: PlatformGlobal = {
    env: "unknown",
    br: null,
    dpr: 1,
  };

  public noop = noop;

  public retry = retry;

  constructor(plugins: PlatformPluginOptions<P>[], version?: string) {
    this.version = version || "";
    this.plugins = plugins;
    this.global.env = this.autoEnv();
    this.init();
  }

  protected init() {
    this.global.br = this.useBridge();
    this.global.dpr = this.usePixelRatio();

    const plugins: Record<
      P,
      PlatformPluginOptions<P>
    > = this.plugins.reduce((acc, plugin) => {
      acc[plugin.name] = plugin;

      return acc;
    }, {} as Record<P, PlatformPluginOptions<P>>);
    const pluginNames = this.plugins.map((plugin) => plugin.name);
    const usedPlugins: Record<string, boolean> = {};

    this.usePlugins(plugins, pluginNames, usedPlugins);
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
    switch (this.global.env) {
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
    const { env, br } = this.global;

    if (env === "h5") {
      return globalThis.devicePixelRatio;
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
    usedPlugins: Record<string, boolean>
  ) {
    pluginNames.forEach((pluginName) => {
      const plugin = plugins[pluginName as P];

      if (usedPlugins[pluginName]) {
        return;
      }

      if (plugin === undefined) {
        throw new Error(`Plugin ${pluginName} not found`);
      }

      if (Array.isArray(plugin.dependencies)) {
        this.usePlugins(plugins, plugin.dependencies, usedPlugins);
      }

      const value = plugin.install.call<Platform<P>, [], PlatformPluginValue<P>>(this);

      usedPlugins[plugin.name] = true;
      if (value !== undefined) {
        Reflect.set(this.constructor.prototype, plugin.name, value);
      }
    });
  }

  public switch(env: SupportedPlatform) {
    this.global.env = env;
    this.init();
  }
}
