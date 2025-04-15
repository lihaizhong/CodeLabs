import { platform } from ".";
import { initialPlatformGlobal } from "../../__tests__/mocks";

jest.mock("./plugins/plugin-canvas", () => ({
  name: "getCanvas",
  install() {
    return (_: PlatformCanvas) => "plugin-canvas install successfully";
  },
}));
jest.mock("./plugins/plugin-decode", () => ({
  name: "decode",
  install() {
    return {
      toBuffer: () =>
        "plugin-decode install successfully and toBuffer successfully",
      toBitmap: () =>
        "plugin-decode install successfully and toBitmap successfully",
      toDataURL: () =>
        "plugin-decode install successfully and toDataURL successfully",
      utf8: () => "plugin-decode install successfully and utf8 successfully",
    };
  },
}));
jest.mock("./plugins/plugin-download", () => ({
  name: "remote",
  install() {
    return {
      is: () => "plugin-download install successfully and is successfully",
      fetch: () =>
        "plugin-download install successfully and fetch successfully",
    };
  },
}));
jest.mock("./plugins/plugin-fsm", () => ({
  name: "local",
  install() {
    return {
      write: () => "plugin-fsm install successfully and write successfully",
      read: () => "plugin-fsm install successfully and read successfully",
      remove: () => "plugin-fsm install successfully and remove successfully",
    };
  },
}));
jest.mock("./plugins/plugin-image", () => ({
  name: "image",
  install() {
    return {
      isImage: () =>
        "plugin-image install successfully and isImage successfully",
      isImageBitmap: () =>
        "plugin-image install successfully and isImageBitmap successfully",
      create: () => "plugin-image install successfully and create successfully",
      load: () => "plugin-image install successfully and load successfully",
    };
  },
}));
jest.mock("./plugins/plugin-now", () => ({
  name: "now",
  install() {
    return () => "plugin-now install successfully";
  },
}));
jest.mock("./plugins/plugin-ofs-canvas", () => ({
  name: "getOfsCanvas",
  install() {
    return (_: WechatMiniprogram.CreateOffscreenCanvasOption) =>
      "plugin-ofs-canvas install successfully";
  },
}));
jest.mock("./plugins/plugin-path", () => ({
  name: "path",
  install() {
    return {
      USER_DATA_PATH: "plugin-path install successfully",
      filename: jest.fn(
        () => "plugin-path install successfully and filename successfully"
      ),
      resolve: jest.fn(
        () => "plugin-path install successfully and resolve successfully"
      ),
    };
  },
}));
jest.mock("./plugins/plugin-raf", () => ({
  name: "rAF",
  install() {
    return jest.fn(
      (_0: PlatformCanvas, _1: () => void) => "plugin-raf install successfully"
    );
  },
}));

describe("platform 定义", () => {
  it("platform 是否被定义", () => {
    expect(platform).toBeDefined();
  });

  it("platform 定义是否正确", () => {
    expect(typeof platform).toBe("object");
    expect(typeof platform.global).toBe("object");
    expect(typeof platform.noop).toBe("function");
    expect(typeof platform.path).toBe("object");
    expect(typeof platform.local).toBe("object");
    expect(typeof platform.remote).toBe("object");
    expect(typeof platform.decode).toBe("object");
    expect(typeof platform.image).toBe("object");
    expect(typeof platform.rAF).toBe("function");
    expect(typeof platform.getCanvas).toBe("function");
    expect(typeof platform.getOfsCanvas).toBe("function");
    expect(typeof platform.switch).toBe("function");
  });

  it("检查 global 属性是否正确", () => {
    const { global } = platform;

    expect(typeof global.env).toBe("string");
    expect(typeof global.br).toBe("object");
    expect(typeof global.dpr).toBe("number");
    expect(typeof global.sys).toBe("string");
  });
});

describe("platform 整体测试", () => {
  describe("H5 环境", () => {
    const platformGlobal = initialPlatformGlobal("h5");

    beforeEach(() => {
      platform.switch("h5");
    });

    it("检查 global 是否正确", () => {
      expect(platform.global.env).toBe(platformGlobal.env);
      expect(platform.global.br).toEqual(platformGlobal.br);
      expect(platform.global.dpr).toBe(platformGlobal.dpr);
      expect(platform.global.sys).toBe(platformGlobal.sys);
    });

    it("检查插件是否正常安装", () => {
      expect(typeof platform.getCanvas).toBe("function");
      expect(platform.getCanvas("#container")).toBe(
        "plugin-canvas install successfully"
      );
      expect(typeof platform.getOfsCanvas).toBe("function");
      expect(platform.getOfsCanvas({ width: 300, height: 300 })).toBe(
        "plugin-ofs-canvas install successfully"
      );
      expect(typeof platform.decode).toBe("object");
      expect(platform.decode).toEqual({
        toBuffer: () =>
          "plugin-decode install successfully and toBuffer successfully",
        toBitmap: () =>
          "plugin-decode install successfully and toBitmap successfully",
        toDataURL: () =>
          "plugin-decode install successfully and toDataURL successfully",
        utf8: () => "plugin-decode install successfully and utf8 successfully",
      });
      expect(typeof platform.image).toBe("object");
      expect(platform.image).toEqual({
        isImage: () =>
          "plugin-image install successfully and isImage successfully",
        isImageBitmap: () =>
          "plugin-image install successfully and isImageBitmap successfully",
        create: () =>
          "plugin-image install successfully and create successfully",
        load: () => "plugin-image install successfully and load successfully",
      });
      expect(typeof platform.rAF).toBe("function");
      expect(
        platform.rAF({} as unknown as WechatMiniprogram.Canvas, () => {})
      ).toBe("plugin-raf install successfully");
      expect(typeof platform.local).toBe("object");
      expect(platform.local).toEqual({
        write: () => "plugin-fsm install successfully and write successfully",
        read: () => "plugin-fsm install successfully and read successfully",
        remove: () => "plugin-fsm install successfully and remove successfully",
      });
      expect(typeof platform.remote).toBe("object");
      expect(platform.remote).toEqual({
        is: () => "plugin-download install successfully and is successfully",
        fetch: () =>
          "plugin-download install successfully and fetch successfully",
      });
      expect(typeof platform.path).toBe("object");
      expect(platform.path).toEqual({
        USER_DATA_PATH: "plugin-path install successfully",
        filename: () =>
          "plugin-path install successfully and filename successfully",
        resolve: () =>
          "plugin-path install successfully and resolve successfully",
      });
      expect(typeof platform.now).toBe("function");
      expect(platform.now()).toBe("plugin-now install successfully");
    });
  });

  describe("小程序(weapp) 环境", () => {
    const platformGlobal = initialPlatformGlobal("weapp");

    beforeEach(() => {
      platform.switch("weapp");
    });

    it("检查 global 是否正确", () => {
      expect(platform.global.env).toBe(platformGlobal.env);
      expect(platform.global.br).toEqual(platformGlobal.br);
      expect(platform.global.dpr).toBe(platformGlobal.dpr);
      expect(platform.global.sys).toBe(platformGlobal.sys);
    });

    it("检查插件是否正常安装", () => {});
  });

  describe("小程序(alipay) 环境", () => {
    const platformGlobal = initialPlatformGlobal("alipay");

    beforeEach(() => {
      platform.switch("alipay");
    });

    it("检查 global 是否正确", () => {
      expect(platform.global.env).toBe(platformGlobal.env);
      expect(platform.global.br).toEqual(platformGlobal.br);
      expect(platform.global.dpr).toBe(platformGlobal.dpr);
      expect(platform.global.sys).toBe(platformGlobal.sys);
    });

    it("检查插件是否正常安装", () => {});
  });

  describe("小程序(tt) 环境", () => {
    const platformGlobal = initialPlatformGlobal("tt");

    beforeEach(() => {
      platform.switch("tt");
    });

    it("检查 global 是否正确", () => {
      expect(platform.global.env).toBe(platformGlobal.env);
      expect(platform.global.br).toEqual(platformGlobal.br);
      expect(platform.global.dpr).toBe(platformGlobal.dpr);
      expect(platform.global.sys).toBe(platformGlobal.sys);
    });

    it("检查插件是否正常安装", () => {});
  });
});
