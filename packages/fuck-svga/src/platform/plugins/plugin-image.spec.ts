import { initialPlatformGlobal } from "../../__tests__/initial";
import pluginImage from "./plugin-image";

jest.mock("./plugin-decode", () => ({
  toBitmap: () => Promise.resolve("to bitmap success"),
  toDataURL: () => Promise.resolve("to data url success"),
}));

describe("pluginImage 定义", () => {
  beforeAll(() => {
    global.ImageBitmap = jest.fn();
    // @ts-ignore
    global.ImageBitmap.mockImplementation(() => ({
      width: 0,
      height: 0,
      close: () => "close success",
    }));
    global.createImageBitmap = jest.fn(() => Promise.resolve(new ImageBitmap()));
  });

  it("image 是否被定义", () => {
    expect(pluginImage).toBeDefined();
  });

  it("image 定义是否正确", () => {
    expect(typeof pluginImage).toBe("object");
    expect(typeof pluginImage.name).toBe("string");
    expect(typeof pluginImage.install).toBe("function");
    expect(pluginImage.name).toBe("image");
  });
});

describe("pluginImage 插件", () => {
  describe("H5 环境", () => {
    const platform = { global: initialPlatformGlobal.h5 };

    it("检查插件是否正常安装", () => {
      const image = pluginImage.install.call(platform);

      expect(typeof image).toBe("object");
      expect(typeof image.isImage).toBe("function");
      expect(typeof image.isImageBitmap).toBe("function");
      expect(typeof image.create).toBe("function");
      expect(typeof image.load).toBe("function");
    });

    it("检查 isImage 是否正常工作", () => {
      const image = pluginImage.install.call(platform);

      expect(image.isImage(new Image())).toBeTruthy();
      expect(image.isImage({ src: "", width: 0, height: 0 })).toBeFalsy();
    });

    it("检查 isImageBitmap 是否正常工作", () => {
      const image = pluginImage.install.call(platform);

      expect(image.isImageBitmap()).toBeTruthy();
      expect(image.isImage(new Image())).toBeFalsy();
    });

    it("检查 create 是否正常工作", () => {
      const image = pluginImage.install.call(platform);

      expect(image.create()).toBeInstanceOf(Image);
    });

    it("检查 load 是否正常工作", async () => {
      const image = pluginImage.install.call(platform);
      const brush = () => image.create();
      const u8a = new Uint8Array([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
        0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x02, 0x08, 0x06, 0x00, 0x00, 0x00, 0x72, 0xb6, 0x0d,
        0x24, 0x00, 0x00, 0x00, 0x11, 0x49, 0x44, 0x41, 0x54, 0x78, 0xda, 0x63, 0xf8, 0xcf, 0xc0, 0xf0,
        0x1f, 0x84, 0x19, 0x60, 0x0c, 0x00, 0x47, 0xca, 0x07, 0xf9, 0x1a, 0xb6, 0xf1, 0xa9, 0x00, 0x00,
        0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82
      ]);
      const b64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEUlEQVR42mP4z8DwH4QZYAwAR8oH+Rq28akAAAAASUVORK5CYII=";
      const bitmap = await globalThis.createImageBitmap(new Blob([u8a]));

      expect(image.load(brush, u8a)).toBeInstanceOf(Promise);
      expect(image.load(brush, u8a)).resolves.toBe("to bitmap success");
      expect(image.load(brush, b64)).toBeInstanceOf(Promise);
      // expect(image.load(brush, b64)).resolves.toBe();
    });
  });

  describe("小程序(weapp, alipay, tt) 环境", () => {
    const platform = { global: initialPlatformGlobal.weapp };

    it("检查插件是否正常安装", () => {
      const image = pluginImage.install.call(platform);

      expect(typeof image).toBe("object");
      expect(typeof image.isImage).toBe("function");
      expect(typeof image.isImageBitmap).toBe("function");
      expect(typeof image.create).toBe("function");
      expect(typeof image.load).toBe("function");
    });

    it("检查 isImage 是否正常工作", () => {
      const image = pluginImage.install.call(platform);

      expect(image.isImage("")).toBeFalsy();
      expect(image.isImage({ src: "", width: 0, height: 0 })).toBeTruthy();
    });

    it("检查 isImageBitmap 是否正常工作", () => {
      const image = pluginImage.install.call(platform);

      expect(image.isImageBitmap(new Image())).toBeFalsy();
    });

    it("检查 create 是否正常工作", () => {});

    it("检查 load 是否正常工作", () => {});
  });
});
