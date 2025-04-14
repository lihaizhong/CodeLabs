import { platform } from ".";
import { initialPlatformGlobal } from "../../__tests__/mocks";

jest.mock("./plugins/plugin-canvas", () => ({
  name: "getCanvas",
  install: () => (_: PlatformCanvas) => "plugin-canvas install successfully",
}));
jest.mock("./plugins/plugin-decode", () => ({
  name: "decode",
  install: () => "plugin-decode install successfully",
}));
jest.mock("./plugins/plugin-download", () => ({
  name: "remote",
  install: () => "plugin-download install successfully",
}));
jest.mock("./plugins/plugin-fsm", () => ({
  name: "local",
  install: () => "plugin-fsm install successfully",
}));
jest.mock("./plugins/plugin-image", () => ({
  name: "image",
  install: () => "plugin-image install successfully",
}));
jest.mock("./plugins/plugin-now", () => ({
  name: "now",
  install: () => () => "plugin-now install successfully",
}));
jest.mock("./plugins/plugin-ofs-canvas", () => ({
  name: "getOfsCanvas",
  install: () => (_: WechatMiniprogram.CreateOffscreenCanvasOption) => "plugin-ofs-canvas install successfully",
}));
jest.mock("./plugins/plugin-path", () => ({
  name: "path",
  install: () => "plugin-path install successfully",
}));
jest.mock("./plugins/plugin-raf", () => ({
  name: "rAF",
  install: () => (_0: PlatformCanvas,_1: () => void) =>"plugin-raf install successfully",
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
    expect(typeof global.fsm).toBe("object");
    expect(typeof global.sys).toBe("string");
  });
});

describe("platform 整体测试", () => {
  describe("H5 环境", () => {
    const platformGlobal = initialPlatformGlobal("h5");

    platform.switch("h5");

    it("检查 global 是否正确", () => {
      expect(platform.global.env).toBe(platformGlobal.env);
      expect(platform.global.br).toEqual(platformGlobal.br);
      expect(platform.global.dpr).toBe(platformGlobal.dpr);
      expect(platform.global.fsm).toEqual(platformGlobal.fsm);
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
      expect(typeof platform.decode).toBe("string");
      expect(platform.decode).toBe("plugin-decode install successfully");
      expect(typeof platform.image).toBe("string");
      expect(platform.image).toBe("plugin-image install successfully");
      expect(typeof platform.rAF).toBe("function");
      expect(
        platform.rAF(
          {} as unknown as WechatMiniprogram.Canvas,
          () => {}
        )
      ).toBe("plugin-raf install successfully");
      expect(typeof platform.local).toBe("string");
      expect(platform.local).toBe("plugin-fsm install successfully");
      expect(typeof platform.remote).toBe("string");
      expect(platform.remote).toBe("plugin-download install successfully");
      expect(typeof platform.path).toBe("string");
      expect(platform.path).toBe("plugin-path install successfully");
      expect(typeof platform.now).toBe("function");
      expect(platform.now()).toBe("plugin-now install successfully");
    });
  });

  describe("小程序(weapp) 环境", () => {
    const platformGlobal = initialPlatformGlobal("weapp");

    platform.switch("weapp");

    it("检查 global 是否正确", () => {
      expect(platform.global.env).toBe(platformGlobal.env);
      expect(platform.global.br).toEqual(platformGlobal.br);
      expect(platform.global.dpr).toBe(platformGlobal.dpr);
      expect(platform.global.fsm).toEqual(platformGlobal.fsm);
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
      expect(typeof platform.decode).toBe("string");
      expect(platform.decode).toBe("plugin-decode install successfully");
      expect(typeof platform.image).toBe("string");
      expect(platform.image).toBe("plugin-image install successfully");
      expect(typeof platform.rAF).toBe("function");
      expect(
        platform.rAF(
          {
            requestAnimationFrame: (_: () => void) => 23,
          } as unknown as WechatMiniprogram.Canvas,
          () => {}
        )
      ).toBe("plugin-raf install successfully");
      expect(typeof platform.local).toBe("string");
      expect(platform.local).toBe("plugin-fsm install successfully");
      expect(typeof platform.remote).toBe("string");
      expect(platform.remote).toBe("plugin-download install successfully");
      expect(typeof platform.path).toBe("string");
      expect(platform.path).toBe("plugin-path install successfully");
      expect(typeof platform.now).toBe("function");
      expect(platform.now()).toBe("plugin-now install successfully");
    });
  });

  describe("小程序(alipay) 环境", () => {
    const platformGlobal = initialPlatformGlobal("alipay");

    platform.switch("alipay");

    it("检查 global 是否正确", () => {
      expect(platform.global.env).toBe(platformGlobal.env);
      expect(platform.global.br).toEqual(platformGlobal.br);
      expect(platform.global.dpr).toBe(platformGlobal.dpr);
      expect(platform.global.fsm).toEqual(platformGlobal.fsm);
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
      expect(typeof platform.decode).toBe("string");
      expect(platform.decode).toBe("plugin-decode install successfully");
      expect(typeof platform.image).toBe("string");
      expect(platform.image).toBe("plugin-image install successfully");
      expect(typeof platform.rAF).toBe("function");
      expect(
        platform.rAF(
          {
            requestAnimationFrame: (_: () => void) => 23,
          } as unknown as WechatMiniprogram.Canvas,
          () => {}
        )
      ).toBe("plugin-raf install successfully");
      expect(typeof platform.local).toBe("string");
      expect(platform.local).toBe("plugin-fsm install successfully");
      expect(typeof platform.remote).toBe("string");
      expect(platform.remote).toBe("plugin-download install successfully");
      expect(typeof platform.path).toBe("string");
      expect(platform.path).toBe("plugin-path install successfully");
      expect(typeof platform.now).toBe("function");
      expect(platform.now()).toBe("plugin-now install successfully");
    });
  });

  describe("小程序(tt) 环境", () => {
    const platformGlobal = initialPlatformGlobal("tt")

    platform.switch("tt");

    it("检查 global 是否正确", () => {
      expect(platform.global.env).toBe(platformGlobal.env);
      expect(platform.global.br).toEqual(platformGlobal.br);
      expect(platform.global.dpr).toBe(platformGlobal.dpr);
      expect(platform.global.fsm).toEqual(platformGlobal.fsm);
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
      expect(typeof platform.decode).toBe("string");
      expect(platform.decode).toBe("plugin-decode install successfully");
      expect(typeof platform.image).toBe("string");
      expect(platform.image).toBe("plugin-image install successfully");
      expect(typeof platform.rAF).toBe("function");
      expect(
        platform.rAF(
          {
            requestAnimationFrame: (_: () => void) => 23,
          } as unknown as WechatMiniprogram.Canvas,
          () => {}
        )
      ).toBe("plugin-raf install successfully");
      expect(typeof platform.local).toBe("string");
      expect(platform.local).toBe("plugin-fsm install successfully");
      expect(typeof platform.remote).toBe("string");
      expect(platform.remote).toBe("plugin-download install successfully");
      expect(typeof platform.path).toBe("string");
      expect(platform.path).toBe("plugin-path install successfully");
      expect(typeof platform.now).toBe("function");
      expect(platform.now()).toBe("plugin-now install successfully");
    });
  });
});
