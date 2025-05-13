jest.mock("../src/definePlugin", () => ({
  definePlugin: (
    plugin: OctopusPlatform.PlatformPlugin
  ) => plugin,
}));
