import { initialPlatformGlobal } from "../../../__tests__/mocks";
import pluginDownload from "./plugin-download";

describe("pluginDownload 定义", () => {
  it("remote 是否被定义", () => {
    expect(pluginDownload).toBeDefined();
  });

  it("remote 定义是否正确", () => {
    expect(typeof pluginDownload).toBe("object");
    expect(typeof pluginDownload.name).toBe("string");
    expect(typeof pluginDownload.install).toBe("function");
    expect(pluginDownload.name).toBe("remote");
  });
});

describe("pluginDownload 插件", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("H5 环境", () => {
    const platform = { global: initialPlatformGlobal("h5") };

    it("检查插件是否正常安装", () => {
      const download = pluginDownload.install.call(platform);

      expect(typeof download).toBe("object");
      expect(typeof download.is).toBe("function");
      expect(typeof download.fetch).toBe("function");
    });

    it("is 调用成功", async () => {
      const download = pluginDownload.install.call(platform);

      expect(download.is("https://www.test.com/test/frame01.svga")).toBe(true);
      expect(download.is("http://www.test.com/test/frame01.svga")).toBe(true);
      expect(download.is("file:///test/frame01.svga")).toBe(false);
    });

    it("fetch 调用成功", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(1024)),
      });

      const download = pluginDownload.install.call(platform);
      const result = await download.fetch(
        "https://www.test.com/test/frame01.svga"
      );

      expect(result).toBeInstanceOf(ArrayBuffer);
    });

    it("fetch 调用失败", () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
      });

      const download = pluginDownload.install.call(platform);
      const downloadAwait = download.fetch(
        "https://www.test.com/test/frame01.svga"
      );

      expect(downloadAwait).rejects.toThrow(
        "HTTP error, status=404, statusText=Not Found"
      );
    });
  });

  describe("小程序(weapp, alipay, tt) 环境", () => {
    const platform = { global: initialPlatformGlobal("weapp") };

    it("检查插件是否正常安装", () => {
      const download = pluginDownload.install.call(platform);

      expect(typeof download).toBe("object");
      expect(typeof download.is).toBe("function");
      expect(typeof download.fetch).toBe("function");
    });

    it("is 调用成功", async () => {
      const download = pluginDownload.install.call(platform);

      expect(download.is("https://www.test.com/test/frame01.svga")).toBe(true);
      expect(download.is("http://www.test.com/test/frame01.svga")).toBe(true);
      expect(download.is("file:///test/frame01.svga")).toBe(false);
    });

    it("fetch 调用成功", async () => {
      platform.global.br.request = jest.fn().mockImplementation((options) => {
        options.success({
          statusCode: 200,
          data: new ArrayBuffer(1024),
        });
      });

      const download = pluginDownload.install.call(platform);
      const result = await download.fetch(
        "https://www.test.com/test/frame01.svga"
      );

      expect(platform.global.br.request).toHaveBeenCalledWith({
        url: "https://www.test.com/test/frame01.svga",
        dataType: "arraybuffer",
        responseType: "arraybuffer",
        enableCache: true,
        success: expect.any(Function),
        fail: expect.any(Function),
      });
      expect(result).toBeInstanceOf(ArrayBuffer);
    });

    it("fetch 调用失败", () => {
      platform.global.br.request = jest.fn().mockImplementation((options) => {
        options.fail({
          statusCode: 404,
          errMsg: "Not Found",
        });
      });

      const download = pluginDownload.install.call(platform);
      const downloadAwait = download.fetch(
        "https://www.test.com/test/frame01.svga"
      );

      expect(platform.global.br.request).toHaveBeenCalledWith({
        url: "https://www.test.com/test/frame01.svga",
        dataType: "arraybuffer",
        responseType: "arraybuffer",
        enableCache: true,
        success: expect.any(Function),
        fail: expect.any(Function),
      });
      expect(downloadAwait).rejects.toStrictEqual({
        statusCode: 404,
        errMsg: "Not Found",
      });
    });
  });
});
