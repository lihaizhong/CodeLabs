import { initialPlatformGlobal } from "../../../__tests__/mocks";
import pluginRaf from "./plugin-raf";

describe("pluginRaf 定义", () => {
  it("rAF 是否被定义", () => {
    expect(pluginRaf).toBeDefined();
  });

  it("rAF 定义是否正确", () => {
    expect(typeof pluginRaf).toBe("object");
    expect(typeof pluginRaf.name).toBe("string");
    expect(typeof pluginRaf.install).toBe("function");
    expect(pluginRaf.name).toBe("rAF");
  });
});

describe("pluginRaf 插件", () => {
  beforeAll(() => {
    jest.useFakeTimers();
  })

  afterAll(() => {
    jest.useRealTimers();
  })

  describe("H5 环境", () => {
    const platform = { global: initialPlatformGlobal("h5") };

    it("检查插件是否正常安装", () => {
      expect(typeof pluginRaf.install.call(platform)).toBe("function");
    })
  });

  describe("小程序(weapp, alipay, tt) 环境", () => {
    const platform = { global: initialPlatformGlobal("weapp") };

    it("检查插件是否正常安装", () => {
      expect(typeof pluginRaf.install.call(platform)).toBe("function");
    })
  })
});
