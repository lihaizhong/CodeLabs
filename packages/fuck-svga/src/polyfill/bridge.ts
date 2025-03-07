import { Env, SE } from "../env";

function getBridge() {
  if (Env.is(SE.H5)) {
    return window;
  }
  
  if (Env.is(SE.ALIPAY)) {
    return my;
  }
  
  if (Env.is(SE.DOUYIN)) {
    return tt;
  }
  
  return wx;
}

export const br = getBridge();
