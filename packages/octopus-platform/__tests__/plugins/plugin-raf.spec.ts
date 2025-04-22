import { initialPlatformGlobal } from "../../__mocks__";
import pluginRaf from "../../src/plugins/plugin-raf";

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
  const nowDate = new Date();
  const nowTimestamp = nowDate.getTime();

  beforeEach(() => {
    jest.useFakeTimers({ now: nowDate });
    jest.setSystemTime(nowTimestamp);
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe("H5 环境", () => {
    const platform = { globals: initialPlatformGlobal("h5") };

    it("检查插件是否正常安装", () => {
      expect(typeof pluginRaf.install.call(platform)).toBe("function");
    });

    it("检查 rAF 函数是否正常", () => {
      const rAF = pluginRaf.install.call(platform);

      const callback = jest.fn();
      const mockCanvas = {} as WechatMiniprogram.Canvas;
      const handle = rAF(mockCanvas, callback);
      expect(typeof handle).toBe("number");
      expect(callback).not.toHaveBeenCalled();

      jest.runAllTimers();

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe("小程序(weapp, alipay, tt) 环境", () => {
    const platform = { globals: initialPlatformGlobal("weapp") };

    it("检查插件是否正常安装", () => {
      expect(typeof pluginRaf.install.call(platform)).toBe("function");
    });

    it("检查 rAF 函数是否正常", () => {
      const rAF = pluginRaf.install.call(platform);

      const callback = jest.fn();
      const mockCanvas = {
        requestAnimationFrame(callback: FrameRequestCallback) {
          return globalThis.requestAnimationFrame(callback);
        }
      } as WechatMiniprogram.Canvas;
      const handle = rAF(mockCanvas, callback);
      expect(typeof handle).toBe("number");
      expect(callback).not.toHaveBeenCalled();

      jest.runAllTimers();

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });
});
