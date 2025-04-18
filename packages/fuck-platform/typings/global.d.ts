declare namespace FuckPlatform {
  export type SupportedPlatform = "weapp" | "alipay" | "tt" | "h5" | "unknown";

  export interface PlatformGlobal {
    env: SupportedPlatform;
    br: any;
    dpr: number;
  }

  export interface PlatformPlugin<T extends string, R> {
    name: T;
    dependencies?: string[];
    install(this: Platform): R;
  }

  export interface Platform<P extends string, O> {
    global: PlatformGlobal;

    noop: () => any;

    retry: <R>(fn: () => R, intervals: number[] = [], times: number = 0) => Promise<R>;

    switch: (env: SupportedPlatform) => void;
  }
}
