declare namespace OctopusPlatform {
  export type SupportedPlatform = "weapp" | "alipay" | "tt" | "h5" | "unknown";

  export interface PlatformGlobals {
    env: SupportedPlatform;
    br: any;
    dpr: number;
  }

  export type PlatformPluginProperty = keyof PlatformPlugin;

  export type PlatformPluginValue<T extends PlatformPluginProperty> =
    PlatformPlugin[T];

  export interface PlatformPluginOptions<P extends PlatformPluginProperty> {
    name: P;
    dependencies?: string[];
    install: (this: Platform) => PlatformPluginValue<P>;
  }

  export interface Platform {
    globals: PlatformGlobals;

    noop: () => any;

    retry: <T>(
      fn: () => T | Promise<T>,
      intervals?: number[],
      times?: number
    ) => Promise<T>;

    setGlobalCanvas: (
      canvas:
        | OctopusPlatform.PlatformCanvas
        | OctopusPlatform.PlatformOffscreenCanvas
        | null
    ) => void;

    getGlobalCanvas: () =>
      | OctopusPlatform.PlatformCanvas
      | OctopusPlatform.PlatformOffscreenCanvas
      | null;

    switch: (env: SupportedPlatform) => void;
  }
}
