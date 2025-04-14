export type MockPlatformEnv = "h5" | "weapp" | "alipay" | "tt";

export interface MockBasicBridge {
  createSelectorQuery: jest.Mock;
  arrayBufferToBase64: jest.Mock;
  request: jest.Mock;
  getFileSystemManager: jest.Mock;
  getPerformance: jest.Mock;
}

export interface MockWeappBridge extends MockBasicBridge {
  env: {
    USER_DATA_PATH: string;
  };
  getWindowInfo: jest.Mock;
  getDeviceInfo: jest.Mock;
  createOffscreenCanvas: jest.Mock;
}

export interface MockAlipayBridge extends MockBasicBridge {
  env: {
    USER_DATA_PATH: string;
  };
  isIDE: boolean;
  getWindowInfo: jest.Mock;
  getDeviceBaseInfo: jest.Mock;
  createOffscreenCanvas: jest.Mock;
}

export interface MockTtBridge extends MockBasicBridge {
  getSystemInfoSync: jest.Mock;
  getDeviceInfoSync: jest.Mock;
  getEnvInfoSync: jest.Mock;
  createOffscreenCanvas: jest.Mock;
}

export interface MockBasicPlatformGlobal {
  env: MockPlatformEnv;
  fsm: any;
  dpr: number;
  isPerf: boolean;
  sys: string;
}

export interface MockWeappPlatformGlobal extends MockBasicPlatformGlobal {
  br: MockWeappBridge;
}

export interface MockAlipayPlatformGlobal extends MockBasicPlatformGlobal {
  br: MockAlipayBridge;
}

export interface MockTtPlatformGlobal extends MockBasicPlatformGlobal {
  br: MockTtBridge;
}

export interface MockH5PlatformGlobal extends MockBasicPlatformGlobal {
  br: Window;
}

function initialPlatformGlobal(env: "weapp"): MockWeappPlatformGlobal;
function initialPlatformGlobal(env: "alipay"): MockAlipayPlatformGlobal;
function initialPlatformGlobal(env: "tt"): MockTtPlatformGlobal;
function initialPlatformGlobal(env: "h5"): MockH5PlatformGlobal;
function initialPlatformGlobal(
  env: MockPlatformEnv
):
  | MockWeappPlatformGlobal
  | MockAlipayPlatformGlobal
  | MockTtPlatformGlobal
  | MockH5PlatformGlobal {
  const fileSystemManager = jest.fn(() => ({
    access: jest.fn(() => {}),
    writeFile: jest.fn(() => {}),
    readFile: jest.fn(() => {}),
    removeFile: jest.fn(() => {}),
  }));
  const selectorQuery = jest.fn(() => ({
    in: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    fields: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  }));
  const getWindowInfo = jest.fn(() => ({
    pixelRatio: 2,
  }));
  const getDeviceInfo = jest.fn(() => ({ platform: "ios" }));
  const bridge: MockBasicBridge = {
    createSelectorQuery: selectorQuery,
    arrayBufferToBase64: jest.fn((_: ArrayBuffer) => "mocked base64 data"),
    request: jest.fn(() => Promise.resolve()),
    getFileSystemManager: fileSystemManager,
    getPerformance: jest.fn(),
  };

  if (env === "weapp") {
    return {
      env: "weapp",
      br: {
        ...bridge,
        env: {
          USER_DATA_PATH: "https://user/data/0",
        },
        getWindowInfo,
        getDeviceInfo,
        createOffscreenCanvas: jest.fn(
          (options: { width: number; height: number }) =>
            new OffscreenCanvas(options.width, options.height)
        ),
      },
      fsm: fileSystemManager,
      dpr: 2,
      isPerf: true,
      sys: "ios",
    };
  }

  if (env === "alipay") {
    return {
      env: "alipay",
      br: {
        ...bridge,
        isIDE: false,
        env: {
          USER_DATA_PATH: "https://user/data/0",
        },
        getWindowInfo,
        getDeviceBaseInfo: getDeviceInfo,
        createOffscreenCanvas: jest.fn(
          (options: { width: number; height: number }) =>
            new OffscreenCanvas(options.width, options.height)
        ),
      },
      fsm: fileSystemManager,
      dpr: 2,
      isPerf: true,
      sys: "ios",
    };
  }

  if (env === "tt") {
    return {
      env: "tt",
      br: {
        ...bridge,
        getSystemInfoSync: getWindowInfo,
        getDeviceInfoSync: getDeviceInfo,
        getEnvInfoSync: jest.fn(() => ({
          common: {
            USER_DATA_PATH: "https://user/data/0",
          },
        })),
        getPerformance: jest.fn(
          () =>
            new Proxy(performance, {
              get(target, prop, receiver) {
                if (prop === "now") {
                  return undefined;
                }

                return Reflect.get(target, prop, receiver);
              },
            })
        ),
        createOffscreenCanvas: jest.fn(() => new OffscreenCanvas(100, 100)),
      },
      fsm: fileSystemManager,
      dpr: 2,
      isPerf: false,
      sys: "ios",
    };
  }

  if (env === "h5") {
    return {
      env: "h5",
      br: window,
      fsm: null,
      dpr: 2,
      isPerf: true,
      sys: "ios",
    };
  }

  throw new Error("Unsupported environment");
}

export { initialPlatformGlobal };
