declare module "fuck-platform" {
  export type SupportedPlatform = "weapp" | "alipay" | "tt" | "h5" | "unknown";

  export interface PlatformGlobal {
    env: SupportedPlatform;
    br: any;
    dpr: number;
  }

  export interface PlatformPluginInstance<P extends string, R> {
    name: P;
    dependencies?: string[];
    install: (this: Platform) => R;
  }

  export interface Platform {
    global: PlatformGlobal;

    noop: () => any;

    retry: <T>(fn: () => T, intervals: number[] = [], times: number = 0) => Promise<T>;

    switch: (env: SupportedPlatform) => void;
  }
}
