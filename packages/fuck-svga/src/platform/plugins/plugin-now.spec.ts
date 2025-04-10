import { initialPlatformGlobal } from "../../__tests__/initial";
import pluginNow from "./plugin-now";

jest.useFakeTimers();

describe("pluginNow 定义", () => {
  it("now 是否被定义", () => {
    expect(pluginNow).toBeDefined();
  });

  it("now 定义是否正确", () => {
    expect(typeof pluginNow).toBe("object");
    expect(typeof pluginNow.name).toBe("string");
    expect(typeof pluginNow.install).toBe("function");
    expect(pluginNow.name).toBe("now");
  });
});

describe("pluginNow 插件", () => {
  describe("H5 环境", () => {
    const platform = { global: initialPlatformGlobal.h5 };
  
    it("检查插件是否正常安装", () => {
      expect(typeof pluginNow.install.call(platform)).toBe("function");
    });
  });
  
  describe("小程序(weapp, alipay) 环境", () => {
    const platform = { global: initialPlatformGlobal.weapp };
  
    it("检查插件是否正常安装", () => {
      expect(typeof pluginNow.install.call(platform)).toBe("function");
    });
  });
  
  describe("小程序(tt) 环境", () => {
    const platform = { global: initialPlatformGlobal.tt };
  
    it("检查插件是否正常安装", () => {
      expect(typeof pluginNow.install.call(platform)).toBe("function");
    });
  });
});
