import { definePlugin, OctopusPlatformPlugins } from "../definePlugin";

// 扩展OctopusPlatformPlugins接口
declare module "../definePlugin" {
  interface OctopusPlatformPlugins {
    local: {
      write: (data: ArrayBufferLike, filepath: string) => Promise<string>;
      read: (filepath: string) => Promise<ArrayBuffer>;
      remove: (filepath: string) => Promise<string>;
    } | null;
  }
}

/**
 * 用于处理本地文件存储
 * @returns
 */
export default definePlugin<"local">({  
  name: "local",
  install() {
    const { env, br } = this.globals;

    if (env === "h5") {
      return null;
    }

    const fsm = br.getFileSystemManager();

    return {
      write: (data: ArrayBufferLike, filePath: string) => {
        return new Promise<string>((resolve, reject) => {
          fsm!.writeFile({
            filePath,
            data,
            success: () => resolve(filePath),
            fail: reject,
          });
        });
      },
      read: (filePath: string) => {
        return new Promise((resolve, reject) => {
          fsm!.readFile({
            filePath,
            success: (res: any) => resolve(res.data),
            fail: reject,
          });
        });
      },
      remove: (filePath: string) => {
        return new Promise((resolve, reject) => {
          fsm!.unlink({
            filePath,
            success: () => resolve(filePath),
            fail: reject,
          });
        });
      },
    } satisfies OctopusPlatformPlugins["local"];
  },
});
