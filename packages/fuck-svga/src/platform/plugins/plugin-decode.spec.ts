import { initialPlatformGlobal } from "../../../__tests__/initial";
import pluginDecode from "./plugin-decode";

jest.mock("../../extensions/protobuf", () => ({
  utf8: jest.fn(() => "mocked utf8 data")
}));

describe("pluginDecode 定义", () => {
  it("decode 是否被定义", () => {
    expect(pluginDecode).toBeDefined();
  });

  it("decode 定义是否正确", () => {
    expect(typeof pluginDecode).toBe("object");
    expect(typeof pluginDecode.name).toBe("string");
    expect(typeof pluginDecode.install).toBe("function");
    expect(pluginDecode.name).toBe("decode");
  });
});

describe("pluginDecode 插件", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("H5 环境", () => {
    const platform = { global: initialPlatformGlobal.h5 };

    it("检查插件是否正常安装", () => {
      const decode = pluginDecode.install.call(platform);

      expect(typeof decode).toBe("object");
      expect(typeof decode.toBuffer).toBe("function");
      expect(typeof decode.toDataURL).toBe("function");
      expect(typeof decode.toBitmap).toBe("function");
      expect(typeof decode.utf8).toBe("function");
    });

    it("toBuffer 调用成功", () => {
      const decode = pluginDecode.install.call(platform);
      const u8a = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
      const { buffer, byteOffset, byteLength } = u8a;

      expect(decode.toBuffer(u8a)).toStrictEqual(buffer.slice(byteOffset, byteOffset + byteLength));
    });

    it("toDataURL 调用成功", () => {
      const decode = pluginDecode.install.call(platform);
      const u8a = new Uint8Array([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
        0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x02, 0x08, 0x06, 0x00, 0x00, 0x00, 0x72, 0xb6, 0x0d,
        0x24, 0x00, 0x00, 0x00, 0x11, 0x49, 0x44, 0x41, 0x54, 0x78, 0xda, 0x63, 0xf8, 0xcf, 0xc0, 0xf0,
        0x1f, 0x84, 0x19, 0x60, 0x0c, 0x00, 0x47, 0xca, 0x07, 0xf9, 0x1a, 0xb6, 0xf1, 0xa9, 0x00, 0x00,
        0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82
      ]);

      expect(decode.toDataURL(u8a)).toBe("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEUlEQVR42mP4z8DwH4QZYAwAR8oH+Rq28akAAAAASUVORK5CYII=");
    });

    it("toBitmap 调用成功", async () => {
      // @ts-ignore
      global.createImageBitmap = jest.fn();
      // @ts-ignore
      global.createImageBitmap.mockResolvedValue(Promise.resolve("mocked image bitmap"));

      const decode = pluginDecode.install.call(platform);
      const u8a = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
      const { buffer, byteOffset, byteLength } = u8a;
      const result = await decode.toBitmap(u8a);

      expect(global.createImageBitmap).toHaveBeenCalledWith(new Blob([buffer.slice(byteOffset, byteOffset + byteLength)]));
      expect(result).toBe("mocked image bitmap");
    });

    it("utf8 调用成功", () => {
      const decode = pluginDecode.install.call(platform);
      const u8a = new Uint8Array([104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100]);

      expect(decode.utf8(u8a, 0, 11)).toBe("hello world");
    });
  });

  describe("小程序(weapp, alipay, tt) 环境", () => {
    const platform = { global: initialPlatformGlobal.weapp };

    it("检查插件是否正常安装", () => {
      const decode = pluginDecode.install.call(platform);

      expect(typeof decode).toBe("object");
      expect(typeof decode.toBuffer).toBe("function");
      expect(typeof decode.toDataURL).toBe("function");
      expect(decode.toBitmap).toBeUndefined();
      expect(typeof decode.utf8).toBe("function");
    });

    it("toBuffer 调用成功", () => {
      const decode = pluginDecode.install.call(platform);
      const u8a = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
      const { buffer, byteOffset, byteLength } = u8a;

      expect(decode.toBuffer(u8a)).toStrictEqual(buffer.slice(byteOffset, byteOffset + byteLength));
    });

    it("toDataURL 调用成功", () => {
      const decode = pluginDecode.install.call(platform);
      const u8a = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d]);

      expect(decode.toDataURL(u8a)).toBe("data:image/png;base64,mocked base64 data");
    });

    it("utf8 调用成功", () => {
      const decode = pluginDecode.install.call(platform);
      const u8a = new Uint8Array([104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100]);

      expect(decode.utf8(u8a, 0, 11)).toBe("mocked utf8 data");
    });
  });
});
