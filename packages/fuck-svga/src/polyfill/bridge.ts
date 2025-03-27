import { Env, SE } from "../env";
import { getProxy } from "./proxy";

export const br = getProxy((_target: any, prop: string) => {
  if (Env.is(SE.H5)) {
    return (globalThis as any)[prop];
  }
  
  if (Env.is(SE.ALIPAY)) {
    return my[prop];
  }
  
  if (Env.is(SE.DOUYIN)) {
    return tt[prop];
  }
  
  return (wx as any)[prop];
});
