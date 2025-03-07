/**
 * Supported Application
 * 目前已支持微信小程序、支付宝小程序、抖音小程序、H5
 */
export const SE = {
  WECHAT: 1,
  ALIPAY: 2,
  DOUYIN: 3,
  H5: 4
};

function getEnvironment() {
  // FIXME：由于抖音场景支持wx对象，所以需要放在wx对象之前检查
  if (typeof window != "undefined") {
    return SE.H5;
  }
  
  if (typeof tt != "undefined") {
    return SE.DOUYIN;
  }
  
  if (typeof my != "undefined") {
    return SE.ALIPAY;
  }
  
  if (typeof wx != "undefined") {
    return SE.WECHAT;
  }

  throw new Error("Unsupported app");
}

let env: number = getEnvironment();

export const Env = {
  is: (environment: number) => env === environment,

  not: (environment: number) => env !== environment,

  get: () => env,

  set: (environment: number) => {
    env = environment;
  }
}
