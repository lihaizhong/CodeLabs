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

    it("write 调用成功", async () => {
      platform.global.fsm.writeFile = jest
        .fn()
        .mockImplementation((options) => {
          options.success();
        });

      const fsm = pluginFsm.install.call(platform);
      const data = new ArrayBuffer(10);
      const filePath = "test/test.txt";
      const result = await fsm.write(data, filePath);

      expect(platform.global.fsm.writeFile).toHaveBeenCalledTimes(1);
      expect(result).toBe(filePath);
    });

    it("write 调用失败", async () => {
      platform.global.fsm.writeFile = jest
        .fn()
        .mockImplementation((options) => {
          options.fail("write fail");
        });

      const fsm = pluginFsm.install.call(platform);
      const data = new ArrayBuffer(10);
      const filePath = "test/test.txt";

      expect(fsm.write(data, filePath)).rejects.toBe("write fail");
      expect(platform.global.fsm.writeFile).toHaveBeenCalledTimes(1);
    });

    it("read 调用成功", async () => {
      platform.global.fsm.readFile = jest.fn().mockImplementation((options) => {
        options.success({ data: new ArrayBuffer(10) });
      });

      const fsm = pluginFsm.install.call(platform);
      const filePath = "test/test.txt";
      const result = await fsm.read(filePath);

      expect(platform.global.fsm.readFile).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(ArrayBuffer);
    });

    it("read 调用失败", async () => {
      platform.global.fsm.readFile = jest.fn().mockImplementation((options) => {
        options.fail("read fail");
      });

      const fsm = pluginFsm.install.call(platform);
      const filePath = "test/test.txt";

      expect(fsm.read(filePath)).rejects.toBe("read fail");
      expect(platform.global.fsm.readFile).toHaveBeenCalledTimes(1);
    });

    it("remove 调用成功", async () => {
      platform.global.fsm.unlink = jest.fn().mockImplementation((options) => {
        options.success();
      });

      const fsm = pluginFsm.install.call(platform);
      const filePath = "test/test.txt";
      const result = await fsm.remove(filePath);

      expect(platform.global.fsm.unlink).toHaveBeenCalledTimes(1);
      expect(result).toBe(filePath);
    });

    it("remove 调用失败", async () => {
      platform.global.fsm.unlink = jest.fn().mockImplementation((options) => {
        options.fail("remove fail");
      });

      const fsm = pluginFsm.install.call(platform);
      const filePath = "test/test.txt";

      expect(fsm.remove(filePath)).resolves.toBe(filePath);
      expect(platform.global.fsm.unlink).toHaveBeenCalledTimes(1);
    });
  });
});
