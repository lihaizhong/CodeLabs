jest.mock("../src/platform/definePlugin", () => ({
  definePlugin: <T extends string, R>(
    plugin: FuckPlatform.PlatformPlugin<T, R>
  ) => plugin,
}));
