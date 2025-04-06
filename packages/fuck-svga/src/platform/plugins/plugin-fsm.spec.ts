import { initialPlatformGlobal } from "../../__test__/initial";
import pluginFsm from "./plugin-fsm";

describe("pluginFsm defined", () => {
  it("should be defined", () => {
    expect(pluginFsm).toBeDefined();
  });

  it("should be a object", () => {
    expect(typeof pluginFsm).toBe("object");
    expect(typeof pluginFsm.name).toBe("string");
    expect(typeof pluginFsm.install).toBe("function");
    expect(pluginFsm.name).toBe("local");
  });
});

describe("pluginFsm defined with h5", () => {
  let platform: Record<"global", FuckSvga.PlatformGlobal>;

  beforeEach(() => {
    platform = { global: initialPlatformGlobal.h5 };
  });

  it("plugin install", () => {
    expect(pluginFsm.install.call(platform)).toBeNull();
  });
});

describe("pluginFsm defined with weapp, alipay, tt", () => {
  let platform: Record<"global", FuckSvga.PlatformGlobal>;

  beforeEach(() => {
    platform = { global: initialPlatformGlobal.weapp };
  });

  it("plugin install", () => {
    expect(typeof pluginFsm.install.call(platform)).toBe("object");
  });
});
