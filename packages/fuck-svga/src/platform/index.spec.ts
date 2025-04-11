import { platform } from ".";

jest.mock("./plugins/plugin-canvas", () => ({
  name: "getCanvas",
  install: () => {},
}));
jest.mock("./plugins/plugin-decode", () => ({
  name: "decode",
  install: () => {},
}));
jest.mock("./plugins/plugin-download", () => ({
  name: "remote",
  install: () => {},
}));
jest.mock("./plugins/plugin-fsm", () => ({ name: "fsm", install: () => {} }));
jest.mock("./plugins/plugin-image", () => ({
  name: "image",
  install: () => {},
}));
jest.mock("./plugins/plugin-now", () => ({ name: "now", install: () => {} }));
jest.mock("./plugins/plugin-ofs-canvas", () => ({
  name: "getOfsCanvas",
  install: () => {},
}));
jest.mock("./plugins/plugin-path", () => ({ name: "path", install: () => {} }));
jest.mock("./plugins/plugin-raf", () => ({ name: "rAF", install: () => {} }));

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
    expect(typeof global.isPerf).toBe("boolean");
    expect(typeof global.sys).toBe("string");
  });
});

describe("platform 整体测试", () => {
  describe("H5 环境", () => {});

  describe("小程序(weapp) 环境", () => {});

  describe("小程序(alipay) 环境", () => {});

  describe("小程序(tt) 环境", () => {});
})
