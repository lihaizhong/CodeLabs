declare module "fuck-platform" {
  export type SupportedPlatform = "weapp" | "alipay" | "tt" | "h5" | "unknown";

  export interface PlatformGlobal {
    env: SupportedPlatform;
    br: any;
    dpr: number;
  }

  export type PlatformPluginInstaller = <R>(this: Platform) => R;

  export interface PlatformPlugin<P extends string, R> {
    name: P;
    dependencies?: string[];
    install: PlatformPluginInstaller<R>;
  }
}
