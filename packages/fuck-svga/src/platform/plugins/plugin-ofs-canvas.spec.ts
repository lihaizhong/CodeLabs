import { initialPlatformGlobal } from "../../__tests__/initial";
import pluginOfsCanvas from "./plugin-ofs-canvas";

describe("pluginOfsCanvas 定义", () => {
  it("getOfsCanvas 是否被定义", () => {
    expect(pluginOfsCanvas).toBeDefined();
  });

  it("now 定义是否正确", () => {
    expect(typeof pluginOfsCanvas).toBe("object");
    expect(typeof pluginOfsCanvas.name).toBe("string");
    expect(typeof pluginOfsCanvas.install).toBe("function");
    expect(pluginOfsCanvas.name).toBe("getOfsCanvas");
  });
});

describe("pluginOfsCanvas 插件", () => {
  describe("H5 环境", () => {
    const platform = { global: initialPlatformGlobal.h5 };

    it("检查插件是否正常安装", () => {
      expect(typeof pluginOfsCanvas.install.call(platform)).toBe("function");
    });
  });

  describe("小程序(weapp) 环境", () => {
    const platform = { global: initialPlatformGlobal.weapp };

    it("检查插件是否正常安装", () => {
      expect(typeof pluginOfsCanvas.install.call(platform)).toBe("function");
    });
  });

  describe("小程序(alipay) 环境", () => {
    const platform = { global: initialPlatformGlobal.alipay };

    it("检查插件是否正常安装", () => {
      expect(typeof pluginOfsCanvas.install.call(platform)).toBe("function");
    })
  });

  describe("小程序(tt) 环境", () => {
    const platform = { global: initialPlatformGlobal.tt };

    it("检查插件是否正常安装", () => {
      expect(typeof pluginOfsCanvas.install.call(platform)).toBe("function");
    })
  });
});
