import { initialPlatformGlobal } from "../../../__tests__/mocks";
import pluginNow from "./plugin-now";

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
  const nowDate = new Date();
  const nowTimestamp = nowDate.getTime();

  beforeEach(() => {
    jest.useFakeTimers({ now: nowDate });
    jest.setSystemTime(nowDate);
  });

  beforeEach(() => {
    jest.clearAllTimers();
  })

  describe("H5 环境", () => {
    const platform = { global: initialPlatformGlobal("h5") };

    it("检查插件是否正常安装", () => {
      expect(typeof pluginNow.install.call(platform)).toBe("function");
    });

    it("检查 now 函数是否正常", () => {
      const now = pluginNow.install.call(platform);

      expect(typeof now).toBe("function");
      expect(now()).toBe(0);

      jest.advanceTimersByTime(1000);

      expect(now()).toBe(1000);
    });
  });

  describe("小程序(weapp, alipay) 环境", () => {
    const platform = { global: initialPlatformGlobal("weapp") };

    it("检查插件是否正常安装", () => {
      expect(typeof pluginNow.install.call(platform)).toBe("function");
    });

    it("检查 now 函数是否正常", () => {
      const now = pluginNow.install.call(platform);

      expect(typeof now).toBe("function");
      expect(now()).toBe(nowTimestamp);

      jest.advanceTimersByTime(1000);
      expect(now()).toBe(nowTimestamp + 1000);
    })
  });

  describe("小程序(tt) 环境", () => {
    const platform = { global: initialPlatformGlobal("tt") };

    it("检查插件是否正常安装", () => {
      expect(typeof pluginNow.install.call(platform)).toBe("function");
    });

    it("检查 now 函数是否正常", () => {
      const now = pluginNow.install.call(platform);

      expect(typeof now).toBe("function");
      expect(now()).toBe(nowTimestamp);

      jest.advanceTimersByTime(1000);

      expect(now()).toBe(nowTimestamp + 1000);
    })
  });
});
