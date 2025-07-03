import { definePlugin } from "../definePlugin";

/**
 * 用于处理文件路径
 * @returns
 */
export default definePlugin<"path">({  
  name: "path",
  install() {
    const { env, br } = this.globals;
    const filename = (path: string) =>
      path.substring(path.lastIndexOf("/") + 1);

    if (env === "h5") {
      return {
        USER_DATA_PATH: "",
        is: (_: string) => false,
        filename,
        resolve: (filename: string, prefix?: string) =>
          `${prefix ? `${prefix}__` : ""}${filename}`,
      };
    }

    const { USER_DATA_PATH } =
      env === "tt" ? tt.getEnvInfoSync().common : br.env;

    return {
      USER_DATA_PATH,
      is: (filepath: string) => filepath?.startsWith(USER_DATA_PATH),
      filename,
      resolve: (filename: string, prefix?: string) =>
        `${USER_DATA_PATH}/${prefix ? `${prefix}__` : ""}${filename}`,
    };
  },
});
