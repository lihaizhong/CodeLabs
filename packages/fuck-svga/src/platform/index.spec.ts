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

describe("platform defined", () => {
  it("should be defined", () => {
    expect(platform).toBeDefined();
  });

  it("should be a object", () => {
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

  it("return a object with global properties", () => {
    const { global } = platform;

    expect(typeof global.env).toBe("string");
    expect(typeof global.br).toBe("object");
    expect(typeof global.dpr).toBe("number");
    expect(typeof global.fsm).toBe("object");
    expect(typeof global.isPerf).toBe("boolean");
    expect(typeof global.sys).toBe("string");
  });
});

describe("platform defined with weapp", () => {});

describe("platform defined with h5", () => {});

describe("platform defined with alipay", () => {});

describe("platform defined with tt", () => {});
