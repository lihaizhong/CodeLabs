/**
 * Supported Application
 * 目前已支持微信小程序、支付宝小程序、抖音小程序、H5
 */
export declare const SE: {
    WECHAT: number;
    ALIPAY: number;
    DOUYIN: number;
    H5: number;
};
export declare const Env: {
    is: (environment: number) => boolean;
    not: (environment: number) => boolean;
    get: () => number;
    set: (environment: number) => void;
};
