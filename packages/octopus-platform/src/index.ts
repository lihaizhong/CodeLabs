import { PlatformPlugin, PlatformGlobal, SupportedPlatform } from "octopus-platform";
import { noop, retry } from "./extensions";
import { version } from "../package.json";

export * from "./definePlugin";
export * from "./plugins";
export * from "./extensions";

export class Platform<P extends string, O> {
  private plugins: PlatformPlugin<P, O>[] = [];

  public platformVersion: string = version;

  public version: string = "";

  public global: PlatformGlobal = {
    env: "unknown",
    br: null,
    dpr: 1,
  };

  public noop = noop;

  public retry = retry;

  constructor(plugins: PlatformPlugin<P, O>[], version?: string) {
    this.version = version || "";
    this.plugins = plugins;
    this.global.env = this.autoEnv();
    this.init();
  }

  private init() {
    this.global.br = this.useBridge();
    this.global.dpr = this.usePixelRatio();

    const plugins: Record<
      P,
      PlatformPlugin<P, O>
    > = this.plugins.reduce((acc, plugin) => {
      acc[plugin.name] = plugin;

      return acc;
    }, {} as Record<P, PlatformPlugin<P, O>>);
    const pluginNames = this.plugins.map((plugin) => plugin.name);
    const usedPlugins: Record<string, boolean> = {};

    this.installPlugins(plugins, pluginNames, usedPlugins);
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

  private installPlugins(
    plugins: Record<P, PlatformPlugin<P, O>>,
    pluginNames: string[],
    usedPlugins: Record<string, boolean>
  ) {
    pluginNames.forEach((pluginName) => {
      const plugin = plugins[pluginName as P];

      if (plugin === undefined) {
        throw new Error(`Plugin ${pluginName} not found`);
      }

      if (Array.isArray(plugin.dependencies)) {
        this.installPlugins(plugins, plugin.dependencies, usedPlugins);
      }

      const value = plugin.install.call<Platform<P, O>, [], O>(this);

      usedPlugins[plugin.name] = true;
      if (value !== undefined) {
        Reflect.set(this, plugin.name, value);
      }
    });
  }

  public switch(env: SupportedPlatform) {
    this.global.env = env;
    this.init();
  }
}
