import { initialPlatformGlobal } from "../../../__tests__/initial";
import pluginPath from "./plugin-path";

describe("pluginPath 定义", () => {
  it("path 是否被定义", () => {
    expect(pluginPath).toBeDefined();
  });

  it("path 定义是否正确", () => {
    expect(typeof pluginPath).toBe("object");
    expect(typeof pluginPath.name).toBe("string");
    expect(typeof pluginPath.install).toBe("function");
    expect(pluginPath.name).toBe("path");
  });
});

describe("pluginPath 插件", () => {
  describe("H5 环境", () => {
    const platform = { global: initialPlatformGlobal.h5 };

    it("检查插件是否正常安装", () => {
      expect(typeof pluginPath.install.call(platform)).toBe("object");
    });
  });

  describe("小程序(weapp, alipay) 环境", () => {
    const platform = { global: initialPlatformGlobal.weapp };

    it("检查插件是否正常安装", () => {
      expect(typeof pluginPath.install.call(platform)).toBe("object");
    });
  })

  describe("小程序(tt) 环境", () => {
    const platform = { global: initialPlatformGlobal.tt };

    it("检查插件是否正常安装", () => {
      expect(typeof pluginPath.install.call(platform)).toBe("object");
    });
  });
});
