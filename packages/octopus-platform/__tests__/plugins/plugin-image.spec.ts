import { initialPlatformGlobal } from "../../__mocks__";
import pluginDecode from "../../src/plugins/plugin-decode";
import pluginFsm from "../../src/plugins/plugin-fsm";
import pluginPath from "../../src/plugins/plugin-path";
import pluginImage from "../../src/plugins/plugin-image";
import { OctopusPlatform } from "src/platform";

jest.mock("../../src/plugins/plugin-decode", () => ({
  name: "decode",
  install: () => ({
    toDataURL: () => "to data url success",
    toBuffer: () => "to buffer success",
  }),
}));

jest.mock("../../src/plugins/plugin-fsm", () => ({
  name: "local",
  install: () => ({
    write: () => Promise.resolve("write success"),
    remove: () => Promise.resolve("remove success"),
  }),
}));

jest.mock("../../src/plugins/plugin-path", () => ({
  name: "path",
  install: () => ({
    USER_DATA_PATH: "user data path",
    resolve: () => Promise.resolve("resolve success"),
  }),
}));

describe("pluginImage 定义", () => {
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
    const platform = {
      globals: initialPlatformGlobal("h5"),
      noop: () => {},
      decode: {} as OctopusPlatform<"decode">,
      local: {} as OctopusPlatform<"local">,
    } as OctopusPlatform<"decode" | "local" | "image">;

    platform.decode = pluginDecode.install.call(platform);
    platform.local = null;
    platform.path = pluginPath.install.call(platform);

    it("检查插件是否正常安装", () => {
      const image = pluginImage.install.call(platform);

      expect(typeof image).toBe("object");
      expect(typeof image.load).toBe("function");
    });

    it("检查 load 是否正常工作", async () => {
      const image = pluginImage.install.call(platform);
      const painter = jest.fn(() => ({ createImage: () => new Image() }));
      const u8a = new Uint8Array([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
        0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x02,
        0x08, 0x06, 0x00, 0x00, 0x00, 0x72, 0xb6, 0x0d, 0x24, 0x00, 0x00, 0x00,
        0x11, 0x49, 0x44, 0x41, 0x54, 0x78, 0xda, 0x63, 0xf8, 0xcf, 0xc0, 0xf0,
        0x1f, 0x84, 0x19, 0x60, 0x0c, 0x00, 0x47, 0xca, 0x07, 0xf9, 0x1a, 0xb6,
        0xf1, 0xa9, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42,
        0x60, 0x82,
      ]);
      const b64 =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEUlEQVR42mP4z8DwH4QZYAwAR8oH+Rq28akAAAAASUVORK5CYII=";
      const bitmap = await globalThis.createImageBitmap(new Blob([u8a]));

      expect(image.load(u8a, "")).toBeInstanceOf(Promise);
      expect(image.load(u8a, "")).resolves.toBeInstanceOf(ImageBitmap);
      expect(image.load(b64, "")).toBeInstanceOf(Promise);
      expect(image.load(b64, "")).resolves.toBeInstanceOf(Image);
      expect(image.load(bitmap, "")).toBeInstanceOf(Promise);
      expect(image.load(bitmap, "")).resolves.toBeInstanceOf(ImageBitmap);

      // @ts-ignore
      globalThis = jest.mocked(
        new Proxy(global, {
          has(target, prop) {
            if (prop === "createImageBitmap") {
              return false;
            }

            return Reflect.has(target, prop);
          },
        })
      );

      expect(image.load(u8a, "")).toBeInstanceOf(Promise);
      expect(image.load(u8a, "")).resolves.toBeInstanceOf(Image);
      expect(image.load(b64, "")).toBeInstanceOf(Promise);
      expect(image.load(b64, "")).resolves.toBeInstanceOf(Image);
    });
  });

  describe("小程序(weapp, alipay, tt) 环境", () => {
    const platform = {
      globals: initialPlatformGlobal("weapp"),
      noop: () => {},
      decode: {} as OctopusPlatform.PlatformPlugin["decode"],
      local: {} as OctopusPlatform.PlatformPlugin["local"],
      path: {} as OctopusPlatform.PlatformPlugin["path"],
      getGlobalCanvas() {
        return {
          createImage: () => new Image(),
        };
      },
    } as EnhancedPlatform;

    platform.decode = pluginDecode.install.call(platform);
    platform.local = pluginFsm.install.call(platform);
    platform.path = pluginPath.install.call(platform);

    it("检查插件是否正常安装", () => {
      const image = pluginImage.install.call(platform);

      expect(typeof image).toBe("object");
      expect(typeof image.load).toBe("function");
    });

    it("检查 load 是否正常工作", async () => {
      const image = pluginImage.install.call(platform);
      const painter = jest.mocked({ createImage: () => new Image() });
      const u8a = new Uint8Array([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
        0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x02,
        0x08, 0x06, 0x00, 0x00, 0x00, 0x72, 0xb6, 0x0d, 0x24, 0x00, 0x00, 0x00,
        0x11, 0x49, 0x44, 0x41, 0x54, 0x78, 0xda, 0x63, 0xf8, 0xcf, 0xc0, 0xf0,
        0x1f, 0x84, 0x19, 0x60, 0x0c, 0x00, 0x47, 0xca, 0x07, 0xf9, 0x1a, 0xb6,
        0xf1, 0xa9, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42,
        0x60, 0x82,
      ]);
      const b64 =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEUlEQVR42mP4z8DwH4QZYAwAR8oH+Rq28akAAAAASUVORK5CYII=";
      const bitmap = await globalThis.createImageBitmap(new Blob([u8a]));

      expect(
        image.load(b64, "https://www.test.com/test/test.png")
      ).toBeInstanceOf(Promise);
      expect(
        image.load(b64, "https://www.test.com/test/test.png")
      ).resolves.toBeInstanceOf(Image);
      expect(
        image.load(u8a, "https://www.test.com/test/test.png")
      ).toBeInstanceOf(Promise);
      expect(
        image.load(u8a, "https://www.test.com/test/test.png")
      ).resolves.toBeInstanceOf(Image);
      expect(
        image.load(bitmap, "https://www.test.com/test/test.png")
      ).toBeInstanceOf(Promise);
      expect(
        image.load(bitmap, "https://www.test.com/test/test.png")
      ).resolves.toBeInstanceOf(Image);
    });
  });

  describe("小程序(alipay) 环境", () => {
    const platform = {
      globals: initialPlatformGlobal("alipay"),
      noop: () => {},
      decode: {} as OctopusPlatform.PlatformPlugin["decode"],
      local: {} as OctopusPlatform.PlatformPlugin["local"],
      path: {} as OctopusPlatform.PlatformPlugin["path"],
      getGlobalCanvas() {
        return {
          createImage: () => new Image(),
        };
      },
    } as EnhancedPlatform;

    platform.decode = pluginDecode.install.call(platform);
    platform.local = pluginFsm.install.call(platform);
    platform.path = pluginPath.install.call(platform);

    it("检查 load 是否正常工作", async () => {
      const image = pluginImage.install.call(platform);
      const painter = jest.mocked({ createImage: () => new Image() });
      const u8a = new Uint8Array([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
        0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x02,
        0x08, 0x06, 0x00, 0x00, 0x00, 0x72, 0xb6, 0x0d, 0x24, 0x00, 0x00, 0x00,
        0x11, 0x49, 0x44, 0x41, 0x54, 0x78, 0xda, 0x63, 0xf8, 0xcf, 0xc0, 0xf0,
        0x1f, 0x84, 0x19, 0x60, 0x0c, 0x00, 0x47, 0xca, 0x07, 0xf9, 0x1a, 0xb6,
        0xf1, 0xa9, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42,
        0x60, 0x82,
      ]);
      const b64 =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEUlEQVR42mP4z8DwH4QZYAwAR8oH+Rq28akAAAAASUVORK5CYII=";
      const bitmap = await globalThis.createImageBitmap(new Blob([u8a]));

      expect(
        image.load(b64, "https://www.test.com/test/test.png")
      ).toBeInstanceOf(Promise);
      expect(
        image.load(b64, "https://www.test.com/test/test.png")
      ).resolves.toBeInstanceOf(Image);
      expect(
        image.load(u8a, "https://www.test.com/test/test.png")
      ).toBeInstanceOf(Promise);
      expect(
        image.load(u8a, "https://www.test.com/test/test.png")
      ).resolves.toBeInstanceOf(Image);
      expect(
        image.load(bitmap, "https://www.test.com/test/test.png")
      ).toBeInstanceOf(Promise);
      expect(
        image.load(bitmap, "https://www.test.com/test/test.png")
      ).resolves.toBeInstanceOf(Image);
    });
  });
});
