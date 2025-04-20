import { PlatformPlugin } from "fuck-platform";
import { definePlugin } from "../definePlugin";

/**
 * 用于处理文件路径
 * @returns
 */
export default definePlugin<"path", PlatformPlugin.path>({
  name: "path",
  install() {
    const { env, br } = this.global;
    const filename = (path: string) => path.substring(path.lastIndexOf('/') + 1);

    if (env === "h5") {
      return {
        USER_DATA_PATH: "",
        filename,
        resolve: (_filename: string, _prefix?: string) => "",
      };
    }

    const { USER_DATA_PATH } =
      env === "tt"
        ? tt.getEnvInfoSync().common
        : (br as WechatMiniprogram.Wx).env;

    return {
      USER_DATA_PATH,
      filename,
      resolve: (filename: string, prefix?: string) =>
        `${USER_DATA_PATH}/${prefix ? `${prefix}.` : ""}${filename}`,
    };
  },
});
