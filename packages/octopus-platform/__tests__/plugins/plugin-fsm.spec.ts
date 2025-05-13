import { initialPlatformGlobal } from "../../__mocks__";
import pluginFsm from "../../src/plugins/plugin-fsm";

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
    const platform = { globals: initialPlatformGlobal("h5") };

    it("检查插件是否正常安装", () => {
      expect(pluginFsm.install.call(platform)).toBeNull();
    });
  });

  describe("小程序(weapp, alipay, tt) 环境", () => {
    const platform = { globals: initialPlatformGlobal("weapp") };

    it("检查插件是否正常安装", () => {
      const fsm = pluginFsm.install.call(platform);

      expect(typeof fsm).toBe("object");
      expect(typeof fsm!.write).toBe("function");
      expect(typeof fsm!.read).toBe("function");
      expect(typeof fsm!.remove).toBe("function");
    });

    it("write 调用成功", async () => {
      platform.globals.br.getFileSystemManager.mockImplementation(() => ({
        writeFile: jest.fn((options) => {
          options.success();
        }),
      }));

      const fsm = pluginFsm.install.call(platform);
      const data = new ArrayBuffer(10);
      const filePath = "test/test.txt";
      const result = await fsm!.write(data, filePath);

      expect(result).toBe(filePath);
    });

    it("write 调用失败", async () => {
      platform.globals.br.getFileSystemManager.mockImplementation(() => ({
        writeFile: jest.fn().mockImplementation((options) => {
          options.fail("write fail");
        }),
      }));

      const fsm = pluginFsm.install.call(platform);
      const data = new ArrayBuffer(10);
      const filePath = "test/test.txt";

      expect(fsm!.write(data, filePath)).rejects.toBe("write fail");
    });

    it("read 调用成功", async () => {
      platform.globals.br.getFileSystemManager.mockImplementation(() => ({
        readFile: jest.fn().mockImplementation((options) => {
          options.success({ data: new ArrayBuffer(10) });
        }),
      }));

      const fsm = pluginFsm.install.call(platform);
      const filePath = "test/test.txt";
      const result = await fsm!.read(filePath);

      expect(result).toBeInstanceOf(ArrayBuffer);
    });

    it("read 调用失败", async () => {
      platform.globals.br.getFileSystemManager.mockImplementation(() => ({
        readFile: jest.fn().mockImplementation((options) => {
          options.fail("read fail");
        }),
      }));

      const fsm = pluginFsm.install.call(platform);
      const filePath = "test/test.txt";

      expect(fsm!.read(filePath)).rejects.toBe("read fail");
    });

    it("remove 调用成功", async () => {
      platform.globals.br.getFileSystemManager.mockImplementation(() => ({
        unlink: jest.fn().mockImplementation((options) => {
          options.success();
        }),
      }));

      const fsm = pluginFsm.install.call(platform);
      const filePath = "test/test.txt";
      const result = await fsm!.remove(filePath);

      expect(result).toBe(filePath);
    });

    it("remove 调用失败", async () => {
      platform.globals.br.getFileSystemManager.mockImplementation(() => ({
        unlink: jest.fn().mockImplementation((options) => {
          options.fail("remove fail");
        }),
      }));

      const fsm = pluginFsm.install.call(platform);
      const filePath = "test/test.txt";

      expect(fsm!.remove(filePath)).rejects.toBe('remove fail');
    });
  });
});
