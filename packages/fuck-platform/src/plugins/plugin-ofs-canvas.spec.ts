import { initialPlatformGlobal } from "../../__tests__/mocks";
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
    const platform = { global: initialPlatformGlobal("h5") };

    it("检查插件是否正常安装", () => {
      expect(typeof pluginOfsCanvas.install.call(platform)).toBe("function");
    });

    it("检查 getOfsCanvas 方法是否正常", () => {
      const getOfsCanvas = pluginOfsCanvas.install.call(platform);
      const mockOfsCanvasOptions = { width: 300, height: 300 };

      expect(typeof getOfsCanvas).toBe("function");
      expect(typeof getOfsCanvas(mockOfsCanvasOptions)).toBe("object");
      expect(getOfsCanvas(mockOfsCanvasOptions).canvas).toBeInstanceOf(
        OffscreenCanvas
      );
      expect(getOfsCanvas(mockOfsCanvasOptions).context).toBeInstanceOf(
        OffscreenCanvasRenderingContext2D
      );
      expect(getOfsCanvas(mockOfsCanvasOptions).canvas.width).toBe(
        mockOfsCanvasOptions.width
      );
      expect(getOfsCanvas(mockOfsCanvasOptions).canvas.height).toBe(
        mockOfsCanvasOptions.height
      );
    });
  });

  describe("小程序(weapp) 环境", () => {
    const platform = { global: initialPlatformGlobal("weapp") };

    it("检查插件是否正常安装", () => {
      expect(typeof pluginOfsCanvas.install.call(platform)).toBe("function");
    });

    it("检查 getOfsCanvas 方法是否正常", () => {
      const getOfsCanvas = pluginOfsCanvas.install.call(platform);
      const mockOfsCanvasOptions = { width: 300, height: 300 };

      expect(typeof getOfsCanvas).toBe("function");
      expect(typeof getOfsCanvas(mockOfsCanvasOptions)).toBe("object");
      expect(getOfsCanvas(mockOfsCanvasOptions).canvas).toBeInstanceOf(
        OffscreenCanvas
      );
      expect(getOfsCanvas(mockOfsCanvasOptions).context).toBeInstanceOf(
        OffscreenCanvasRenderingContext2D
      );
      expect(getOfsCanvas(mockOfsCanvasOptions).canvas.width).toBe(
        mockOfsCanvasOptions.width
      );
      expect(getOfsCanvas(mockOfsCanvasOptions).canvas.height).toBe(
        mockOfsCanvasOptions.height
      );
    });
  });

  describe("小程序(alipay) 环境", () => {
    const platform = { global: initialPlatformGlobal("alipay") };

    it("检查插件是否正常安装", () => {
      expect(typeof pluginOfsCanvas.install.call(platform)).toBe("function");
    });

    it("检查 getOfsCanvas 方法是否正常", () => {
      const getOfsCanvas = pluginOfsCanvas.install.call(platform);
      const mockOfsCanvasOptions = { width: 300, height: 300 };

      expect(typeof getOfsCanvas).toBe("function");
      expect(typeof getOfsCanvas(mockOfsCanvasOptions)).toBe("object");
      expect(getOfsCanvas(mockOfsCanvasOptions).canvas).toBeInstanceOf(
        OffscreenCanvas
      );
      expect(getOfsCanvas(mockOfsCanvasOptions).context).toBeInstanceOf(
        OffscreenCanvasRenderingContext2D
      );
      expect(getOfsCanvas(mockOfsCanvasOptions).canvas.width).toBe(
        mockOfsCanvasOptions.width
      );
      expect(getOfsCanvas(mockOfsCanvasOptions).canvas.height).toBe(
        mockOfsCanvasOptions.height
      );
    });
  });

  describe("小程序(tt) 环境", () => {
    const platform = { global: initialPlatformGlobal("tt") };

    it("检查插件是否正常安装", () => {
      expect(typeof pluginOfsCanvas.install.call(platform)).toBe("function");
    });

    it("检查 getOfsCanvas 方法是否正常", () => {
      const getOfsCanvas = pluginOfsCanvas.install.call(platform);
      const mockOfsCanvasOptions = { width: 300, height: 300 };

      expect(typeof getOfsCanvas).toBe("function");
      expect(typeof getOfsCanvas(mockOfsCanvasOptions)).toBe("object");
      expect(getOfsCanvas(mockOfsCanvasOptions).canvas).toBeInstanceOf(
        OffscreenCanvas
      );
      expect(getOfsCanvas(mockOfsCanvasOptions).context).toBeInstanceOf(
        OffscreenCanvasRenderingContext2D
      );
      expect(getOfsCanvas(mockOfsCanvasOptions).canvas.width).toBe(
        mockOfsCanvasOptions.width
      );
      expect(getOfsCanvas(mockOfsCanvasOptions).canvas.height).toBe(
        mockOfsCanvasOptions.height
      );
    });
  });
});
