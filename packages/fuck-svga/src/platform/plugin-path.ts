import { definePlugin } from "./definePlugin";

/**
 * 用于处理文件路径
 * @returns
 */
export default definePlugin<"path">({
  name: "path",
  install() {
    const { env, br } = this.global;

    if (env === "h5") {
      return {
        USER_DATA_PATH: "",
        resolve: (_filename: string, _prefix?: string) => "",
      };
    }

    const { USER_DATA_PATH } =
      env === "tt"
        ? tt.getEnvInfoSync().common
        : (br as WechatMiniprogram.Wx).env;

    return {
      USER_DATA_PATH,
      resolve: (filename: string, prefix?: string) =>
        `${USER_DATA_PATH}/${prefix ? `${prefix}.` : ""}${filename}`,
    };
  },
});
