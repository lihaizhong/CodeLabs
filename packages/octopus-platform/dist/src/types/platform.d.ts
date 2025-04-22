import { PlatformPlugin } from "./plugin";

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
  install: (this: Platform<P>) => PlatformPluginValue<P>;
}

interface Platform<_> {
  globals: PlatformGlobals;

  noop: () => any;

  retry: <T>(
    fn: () => T | Promise<T>,
    intervals?: number[],
    times?: number
  ) => Promise<T>;

  switch: (env: SupportedPlatform) => void;
}
