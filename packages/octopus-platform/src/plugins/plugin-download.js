import { definePlugin } from "../definePlugin";
/**
 * 用于处理远程文件读取
 * @returns
 */
export default definePlugin({
    name: "remote",
    install() {
        const { env, br } = this.globals;
        const isRemote = (url) => /^(blob:)?http(s)?:\/\//.test(url);
        if (env === "h5") {
            return {
                is: isRemote,
                fetch: (url) => fetch(url).then((response) => {
                    if (response.ok) {
                        return response.arrayBuffer();
                    }
                    throw new Error(`HTTP error, status=${response.status}, statusText=${response.statusText}`);
                }),
            };
        }
        function download(url, enableCache) {
            return new Promise((resolve, reject) => {
                br.request({
                    url,
                    // @ts-ignore 支付宝小程序必须有该字段
                    dataType: "arraybuffer",
                    responseType: "arraybuffer",
                    enableCache,
                    success: (res) => resolve(res.data),
                    fail: reject,
                });
            }).catch((err) => {
                const errorMessage = err.errMsg || err.errorMessage || err.message;
                // FIXME: 可能存在写入网络缓存空间失败的情况，此时重新下载
                if (errorMessage.includes("ERR_CACHE_WRITE_FAILURE") ||
                    errorMessage.includes("ERR_CACHE_WRITE_FAILED")) {
                    return download(url, false);
                }
                throw err;
            });
        }
        return {
            is: isRemote,
            fetch: (url) => download(url, true),
        };
    },
});
