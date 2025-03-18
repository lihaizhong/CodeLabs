import { br } from "./bridge";
import { Env, SE } from "../env";

/**
 * 是否是远程链接
 * @param url 链接
 * @returns 
 */
export const isRemote = (url: string) => /^http(s)?:\/\//.test(url);

/**
 * 读取远程文件
 * @param url 文件资源地址
 * @returns
 */
export function readRemoteFile(url: string): Promise<ArrayBuffer> {
  // H5环境
  if (Env.is(SE.H5)) {
    return fetch(url).then((response) => {
      if (response.ok) {
        return response.arrayBuffer();
      } else {
        throw new Error(
          `HTTP error, status=${response.status}, statusText=${response.statusText}`
        );
      }
    });
  }

  // 小程序环境
  return new Promise((resolve, reject) => {
    (br as WechatMiniprogram.Wx).request({
      url,
      // @ts-ignore 支付宝小程序必须有该字段
      dataType: "arraybuffer",
      responseType: "arraybuffer",
      enableCache: true,
      success: (res: any) => resolve(res.data as ArrayBuffer),
      fail: reject,
    });
  });
}
