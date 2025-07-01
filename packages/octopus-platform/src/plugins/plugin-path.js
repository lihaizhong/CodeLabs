import { definePlugin } from "../definePlugin";
/**
 * 用于处理文件路径
 * @returns
 */
export default definePlugin({
    name: "path",
    install() {
        const { env, br } = this.globals;
        const filename = (path) => path.substring(path.lastIndexOf("/") + 1);
        if (env === "h5") {
            return {
                USER_DATA_PATH: "",
                is: (_) => false,
                filename,
                resolve: (filename, prefix) => `${prefix ? `${prefix}__` : ""}${filename}`,
            };
        }
        const { USER_DATA_PATH } = env === "tt" ? tt.getEnvInfoSync().common : br.env;
        return {
            USER_DATA_PATH,
            is: (filepath) => filepath?.startsWith(USER_DATA_PATH),
            filename,
            resolve: (filename, prefix) => `${USER_DATA_PATH}/${prefix ? `${prefix}__` : ""}${filename}`,
        };
    },
});
