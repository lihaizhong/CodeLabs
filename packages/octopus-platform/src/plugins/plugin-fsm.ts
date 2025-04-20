import { PlatformPlugin } from "octopus-platform";
import { definePlugin } from "../definePlugin";

/**
 * 用于处理本地文件存储
 * @returns
 */
export default definePlugin<"local", PlatformPlugin.local | null>({
  name: "local",
  install() {
    const { env, br } = this.global;

    if (env === "h5") {
      return null;
    }

    const fsm = (br as WechatMiniprogram.Wx).getFileSystemManager();

    return {
      write: (
        data: ArrayBuffer,
        filePath: string
      ) => {
        return new Promise<string>((resolve, reject) => {
          fsm!.writeFile({
            filePath,
            data,
            success: () => resolve(filePath),
            fail: (err: unknown) => reject(err),
          });
        });
      },
      read: (filePath: string) => {
        return new Promise((resolve, reject) => {
          fsm!.readFile({
            filePath,
            success: (res: any) => resolve(res.data as ArrayBuffer),
            fail: (err: unknown) => reject(err),
          });
        });
      },
      remove: (filePath: string) => {
        return new Promise((resolve) => {
          fsm!.unlink({
            filePath,
            success: () => resolve(filePath),
            fail: (err: unknown) => resolve(filePath),
          });
        });
      }
    };
  },
});
