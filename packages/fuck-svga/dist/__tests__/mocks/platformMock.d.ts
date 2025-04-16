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
    dpr: number;
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
declare function initialPlatformGlobal(env: "weapp"): MockWeappPlatformGlobal;
declare function initialPlatformGlobal(env: "alipay"): MockAlipayPlatformGlobal;
declare function initialPlatformGlobal(env: "tt"): MockTtPlatformGlobal;
declare function initialPlatformGlobal(env: "h5"): MockH5PlatformGlobal;
export { initialPlatformGlobal };
