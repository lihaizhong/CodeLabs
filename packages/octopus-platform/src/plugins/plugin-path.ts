import { definePlugin, OctopusPlatformPlugins } from "../definePlugin";

// 扩展OctopusPlatformPlugins接口
declare module "../definePlugin" {
  interface OctopusPlatformPlugins {
    path: {
      USER_DATA_PATH: string;
      is: (filepath: string) => boolean;
      filename: (filepath: string) => string;
      resolve: (name: string, prefix?: string) => string;
    };
  }
}

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
      } satisfies OctopusPlatformPlugins["path"];
    }

    const { USER_DATA_PATH } =
      env === "tt" ? tt.getEnvInfoSync().common : br.env;

    return {
      USER_DATA_PATH,
      is: (filepath: string) => filepath?.startsWith(USER_DATA_PATH),
      filename,
      resolve: (filename: string, prefix?: string) =>
        `${USER_DATA_PATH}/${prefix ? `${prefix}__` : ""}${filename}`,
    } satisfies OctopusPlatformPlugins["path"];
  },
});
