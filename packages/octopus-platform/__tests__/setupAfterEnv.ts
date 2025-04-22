import { PlatformPlugin } from "src/types";

jest.mock("../src/definePlugin", () => ({
  definePlugin: (
    plugin: PlatformPlugin
  ) => plugin,
}));
