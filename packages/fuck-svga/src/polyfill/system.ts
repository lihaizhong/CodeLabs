import { Env, SE } from "../env";
import { br } from "./bridge";

function getPlatform() {
  if (Env.is(SE.H5)) {
    const UA = navigator.userAgent;
  
    if (/(Android)/i.test(UA)) {
      return "Android";
    }
    
    if (/(iPhone|iPad|iPod|iOS)/i.test(UA)) {
      return "iOS";
    }
    
    if (/(OpenHarmony|ArkWeb)/i.test(UA)) {
      return "OpenHarmony";
    }
  } else {
    if (Env.is(SE.ALIPAY)) {
      return (br as any).getDeviceBaseInfo().platform as string;
    }
  
    if (Env.is(SE.DOUYIN)) {
      return (br as any).getDeviceInfoSync().platform as string;
    }
  
    if (Env.is(SE.WECHAT)) {
      return (br as any).getDeviceInfo().platform as string;
    }
  }

  return "UNKNOWN";
}

export const platform = getPlatform().toLocaleUpperCase();
