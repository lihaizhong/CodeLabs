import { initialPlatformGlobal } from "../../__tests__/initial";
import pluginDecode from "./plugin-decode";

jest.mock("../../extensions/protobuf", () => ({  utf8: jest.fn() }));

describe("pluginDecode defined", () => {
  it("should be defined", () => {
    expect(pluginDecode).toBeDefined();
  });

  it("should be a object", () => {
    expect(typeof pluginDecode).toBe("object");
    expect(typeof pluginDecode.name).toBe("string");
    expect(typeof pluginDecode.install).toBe("function");
    expect(pluginDecode.name).toBe("decode");
  });
});

describe("pluginDecode defined with h5", () => {
  const platform = { global: initialPlatformGlobal.h5 };

  it("plugin install", () => {
    expect(typeof pluginDecode.install.call(platform)).toBe("object");
  });
});

describe("pluginDecode defined with weapp, alipay, tt", () => {
  const platform = { global: initialPlatformGlobal.weapp };

  it("plugin install", () => {
    expect(typeof pluginDecode.install.call(platform)).toBe("object");
  });
});
