import { OctopusPlatform } from "../../src/platform";
import { initialPlatformGlobal } from "../../__mocks__";
import pluginCodec from "../../src/plugins/plugin-codec";

jest.mock("../../src/extensions/utf8", () => ({
  utf8: jest.fn(() => "mocked utf8 data")
}));

describe("pluginCodec 定义", () => {
  it("codec 是否被定义", () => {
    expect(pluginCodec).toBeDefined();
  });

  it("codec 定义是否正确", () => {
    expect(typeof pluginCodec).toBe("object");
    expect(typeof pluginCodec.name).toBe("string");
    expect(typeof pluginCodec.install).toBe("function");
    expect(pluginCodec.name).toBe("codec");
  });
});

describe("pluginCodec 插件", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("H5 环境", () => {
    const platform = { globals: initialPlatformGlobal("h5") } as OctopusPlatform<"codec">;

    it("检查插件是否正常安装", () => {
      const codec = pluginCodec.install.call(platform);

      expect(typeof codec).toBe("object");
      expect(typeof codec.toBuffer).toBe("function");
      expect(typeof codec.toDataURL).toBe("function");
      expect(typeof codec.utf8).toBe("function");
    });

    it("toBuffer 调用成功", () => {
      const codec = pluginCodec.install.call(platform);
      const u8a = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
      const { buffer, byteOffset, byteLength } = u8a;

      expect(codec.toBuffer(u8a)).toStrictEqual(buffer.slice(byteOffset, byteOffset + byteLength));
    });

    it("toDataURL 调用成功", () => {
      const codec = pluginCodec.install.call(platform);
      const u8a = new Uint8Array([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
        0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x02, 0x08, 0x06, 0x00, 0x00, 0x00, 0x72, 0xb6, 0x0d,
        0x24, 0x00, 0x00, 0x00, 0x11, 0x49, 0x44, 0x41, 0x54, 0x78, 0xda, 0x63, 0xf8, 0xcf, 0xc0, 0xf0,
        0x1f, 0x84, 0x19, 0x60, 0x0c, 0x00, 0x47, 0xca, 0x07, 0xf9, 0x1a, 0xb6, 0xf1, 0xa9, 0x00, 0x00,
        0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82
      ]);

      expect(codec.toDataURL(u8a)).toBe("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEUlEQVR42mP4z8DwH4QZYAwAR8oH+Rq28akAAAAASUVORK5CYII=");
    });

    it("utf8 调用成功", () => {
      const codec = pluginCodec.install.call(platform);
      const u8a = new Uint8Array([104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100]);

      expect(codec.utf8(u8a, 0, 11)).toBe("hello world");
    });
  });

  describe("小程序(weapp, alipay, tt) 环境", () => {
    const platform = { globals: initialPlatformGlobal("weapp") } as OctopusPlatform<"codec">;

    it("检查插件是否正常安装", () => {
      const codec = pluginCodec.install.call(platform);

      expect(typeof codec).toBe("object");
      expect(typeof codec.toBuffer).toBe("function");
      expect(typeof codec.toDataURL).toBe("function");
      expect(typeof codec.utf8).toBe("function");
    });

    it("toBuffer 调用成功", () => {
      const codec = pluginCodec.install.call(platform);
      const u8a = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
      const { buffer, byteOffset, byteLength } = u8a;

      expect(codec.toBuffer(u8a)).toStrictEqual(buffer.slice(byteOffset, byteOffset + byteLength));
    });

    it("toDataURL 调用成功", () => {
      const codec = pluginCodec.install.call(platform);
      const u8a = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d]);

      expect(codec.toDataURL(u8a)).toBe("data:image/png;base64,mocked base64 data");
    });

    it("utf8 调用成功", () => {
      const codec = pluginCodec.install.call(platform);
      const u8a = new Uint8Array([104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100]);

      expect(codec.utf8(u8a, 0, 11)).toBe("mocked utf8 data");
    });
  });
});
