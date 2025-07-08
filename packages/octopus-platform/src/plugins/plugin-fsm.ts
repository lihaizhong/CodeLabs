import { definePlugin } from "../definePlugin";

/**
 * 用于处理本地文件存储
 * @returns
 */
export default definePlugin<"local">({
  name: "local",
  install() {
    const { env, br } = this.globals;

    if (env === "h5" || env === "tt") {
      return null;
    }

    const fsm = br.getFileSystemManager();

    return {
      exists: (filepath: string) =>
        new Promise<boolean>((resolve) => {
          fsm!.access({
            path: filepath,
            success: () => resolve(true),
            fail: () => resolve(false),
          });
        }),
      write: (data: ArrayBufferLike, filePath: string) =>
        new Promise<string>((resolve, reject) => {
          fsm!.writeFile({
            filePath,
            data,
            success: () => resolve(filePath),
            fail: reject,
          });
        }),
      read: (filePath: string) =>
        new Promise((resolve, reject) => {
          fsm!.readFile({
            filePath,
            success: (res: any) => resolve(res.data),
            fail: reject,
          });
        }),
      remove: (filePath: string) =>
        new Promise((resolve, reject) => {
          fsm!.unlink({
            filePath,
            success: () => resolve(filePath),
            fail: reject,
          });
        }),
    };
  },
});
