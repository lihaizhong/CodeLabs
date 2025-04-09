import { initialPlatformGlobal } from "../../__tests__/initial";
import pluginFsm from "./plugin-fsm";

describe("pluginFsm 定义", () => {
  it("fsm 是否被定义", () => {
    expect(pluginFsm).toBeDefined();
  });

  it("fsm 定义是否正确", () => {
    expect(typeof pluginFsm).toBe("object");
    expect(typeof pluginFsm.name).toBe("string");
    expect(typeof pluginFsm.install).toBe("function");
    expect(pluginFsm.name).toBe("local");
  });
});

describe("pluginFsm 插件", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("H5 环境", () => {
    const platform = { global: initialPlatformGlobal.h5 };

    it("检查插件是否正常安装", () => {
      expect(pluginFsm.install.call(platform)).toBeNull();
    });
  });

  describe("小程序(weapp, alipay, tt) 环境", () => {
    const platform = { global: initialPlatformGlobal.weapp };

    it("检查插件是否正常安装", () => {
      const fsm = pluginFsm.install.call(platform);
      expect(typeof fsm).toBe("object");
      expect(typeof fsm.write).toBe("function");
      expect(typeof fsm.read).toBe("function");
      expect(typeof fsm.remove).toBe("function");
    });

    it("write 调用成功", async () => {});

    it("read 调用成功", async () => {});

    it("remove 调用成功", async () => {});
  });
});
