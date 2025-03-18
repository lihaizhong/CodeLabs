/**
 * Supported Application
 * 目前已支持微信小程序、支付宝小程序、抖音小程序、H5
 */
export declare enum SE {
    WECHAT = "weapp",
    ALIPAY = "alipay",
    DOUYIN = "tt",
    H5 = "h5"
}
export declare const Env: {
    is: (environment: SE) => boolean;
    not: (environment: SE) => boolean;
    get: () => SE;
    set: (environment: SE) => void;
};
