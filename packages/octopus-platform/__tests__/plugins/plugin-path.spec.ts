import { initialPlatformGlobal } from "../../__mocks__";
import pluginPath from "../../src/plugins/plugin-path";

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
    const platform = { globals: initialPlatformGlobal("h5") } as OctopusPlatform.Platform;

    it("检查插件是否正常安装", () => {
      expect(typeof pluginPath.install.call(platform)).toBe("object");
    });

    it("检查 USER_DATA_PATH 常量是否正常", () => {
      const { USER_DATA_PATH } = pluginPath.install.call(platform);

      expect(typeof USER_DATA_PATH).toBe("string");
      expect(USER_DATA_PATH).toBe("");
    });

    it("检查 filename 函数是否正常", () => {
      const { filename } = pluginPath.install.call(platform);

      expect(typeof filename).toBe("function");
      expect(filename("https://www.test.com/test/test.png")).toBe("test.png");
    });

    it("检查 resolve 函数是否正常", () => {
      const { resolve } = pluginPath.install.call(platform);

      expect(typeof resolve).toBe("function");
      expect(resolve("test.png")).toBe("");
    });
  });

  describe("小程序(weapp, alipay) 环境", () => {
    const platform = { globals: initialPlatformGlobal("weapp") } as OctopusPlatform.Platform;

    it("检查插件是否正常安装", () => {
      expect(typeof pluginPath.install.call(platform)).toBe("object");
    });

    it("检查 USER_DATA_PATH 常量是否正常", () => {
      const { USER_DATA_PATH } = pluginPath.install.call(platform);

      expect(typeof USER_DATA_PATH).toBe("string");
      expect(USER_DATA_PATH).toBe("https://user/data/0");
    });

    it("检查 filename 函数是否正常", () => {
      const { filename } = pluginPath.install.call(platform);

      expect(typeof filename).toBe("function");
      expect(filename("https://www.test.com/test/test.png")).toBe("test.png");
    });

    it("检查 resolve 函数是否正常", () => {
      const { resolve } = pluginPath.install.call(platform);

      expect(typeof resolve).toBe("function");
      expect(resolve("test.png")).toBe("https://user/data/0/test.png");
      expect(resolve("test.png", "img_127")).toBe("https://user/data/0/img_127.test.png");
    });
  });

  describe("小程序(tt) 环境", () => {
    const platform = { globals: initialPlatformGlobal("tt") } as OctopusPlatform.Platform;

    it("检查插件是否正常安装", () => {
      expect(typeof pluginPath.install.call(platform)).toBe("object");
    });

    it("检查 USER_DATA_PATH 常量是否正常", () => {
      const { USER_DATA_PATH } = pluginPath.install.call(platform);

      expect(typeof USER_DATA_PATH).toBe("string");
      expect(USER_DATA_PATH).toBe("https://user/data/0");
    });

    it("检查 filename 函数是否正常", () => {
      const { filename } = pluginPath.install.call(platform);

      expect(typeof filename).toBe("function");
      expect(filename("https://www.test.com/test/test.png")).toBe("test.png");
    });

    it("检查 resolve 函数是否正常", () => {
      const { resolve } = pluginPath.install.call(platform);

      expect(typeof resolve).toBe("function");
      expect(resolve("test.png")).toBe("https://user/data/0/test.png");
      expect(resolve("test.png", "img_127")).toBe("https://user/data/0/img_127.test.png");
    });
  });
});
