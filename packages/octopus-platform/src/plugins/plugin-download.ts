import { PlatformPlugin } from "fuck-platform";
import { definePlugin } from "../definePlugin";

/**
 * 用于处理远程文件读取
 * @returns
 */
export default definePlugin<"remote", PlatformPlugin.remote>({
  name: "remote",
  install() {
    const { env, br } = this.global;
    const isRemote = (url: string) => /^http(s)?:\/\//.test(url);

    if (env === "h5") {
      return {
        is: isRemote,
        fetch: (url: string) =>
          fetch(url).then((response) => {
            if (response.ok) {
              return response.arrayBuffer();
            }

            throw new Error(
              `HTTP error, status=${response.status}, statusText=${response.statusText}`
            );
          }),
      };
    }

    function download(url: string, enableCache: boolean): Promise<ArrayBuffer> {
      return new Promise<ArrayBuffer>((resolve, reject) => {
        (br as WechatMiniprogram.Wx).request({
          url,
          // @ts-ignore 支付宝小程序必须有该字段
          dataType: "arraybuffer",
          responseType: "arraybuffer",
          enableCache,
          success: (res: any) => resolve(res.data as ArrayBuffer),
          fail: reject,
        });
      }).catch((err) => {
        const errorMessage = err.errMsg || err.errorMessage || err.message;
        // FIXME: 可能存在写入网络缓存空间失败的情况，此时重新下载
        if (errorMessage.includes("ERR_CACHE_WRITE_FAILURE") || errorMessage.includes("ERR_CACHE_WRITE_FAILED")) {
          return download(url, false);
        }

        throw err;
      });
    }

    return {
      is: isRemote,
      fetch: (url: string) => download(url, true),
    };
  },
});
