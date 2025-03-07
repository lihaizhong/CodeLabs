import { br } from "./bridge";
import { readFile } from "./fsm";
import { Env, SE } from "../env";

/**
 * 读取远程文件
 * @param url 文件资源地址
 * @returns
 */
function readRemoteFile(url: string): Promise<ArrayBuffer> {
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

/**
 * 读取文件资源
 * @param url 文件资源地址
 * @returns
 */
export function download(url: string): Promise<ArrayBuffer | null> {
  // 读取远程文件
  if (/^http(s)?:\/\//.test(url)) {
    return readRemoteFile(url);
  }

  // 读取本地文件
  if (Env.not(SE.H5)) {
    return readFile(url);
  }

  return Promise.resolve(null);
}
