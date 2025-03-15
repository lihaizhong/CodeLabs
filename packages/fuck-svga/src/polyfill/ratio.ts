import { Env, SE } from "../env";
import { br } from "./bridge";

/**
 * 获取当前显示设备的物理像素分辨率与CSS 像素分辨率之比
 */
function getDevicePixelRatio(): number {
  if (Env.is(SE.H5)) {
    return globalThis.devicePixelRatio;
  }
  
  if ("getWindowInfo" in br) {
    return (br as any).getWindowInfo().pixelRatio;
  }
  
  if ("getSystemInfoSync" in br) {
    return (br as WechatMiniprogram.Wx).getSystemInfoSync().pixelRatio;
  }

  return 1;
}

export const dpr = getDevicePixelRatio();
