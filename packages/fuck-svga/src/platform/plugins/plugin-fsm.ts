import benchmark from "../../benchmark";
import { definePlugin } from "../definePlugin";

/**
 * 用于处理本地文件存储
 * @returns
 */
export default definePlugin<"local">({
  name: "local",
  install() {
    const { env, fsm } = this.global;

    if (env === "h5") {
      return null;
    }

    return {
      write: (
        data: ArrayBuffer,
        filePath: string
      ) => {
        return new Promise<string>((resolve, reject) => {
          fsm!.writeFile({
            filePath,
            data,
            success() {
              benchmark.log(`write success: ${filePath}`);
              resolve(filePath);
            },
            fail(err: unknown) {
              benchmark.log(`write fail: ${filePath}`, err);
              reject(err);
            },
          });
        });
      },
      read: (filePath: string) => {
        return new Promise((resolve, reject) => {
          fsm!.readFile({
            filePath,
            success: (res: any) => {
              benchmark.log(`read success: ${filePath}`);
              resolve(res.data as ArrayBuffer);
            },
            fail: (err: unknown) => {
              benchmark.log(`read fail: ${filePath}`, err);
              reject(err);
            },
          });
        });
      },
      remove: (filePath: string) => {
        return new Promise((resolve) => {
          fsm!.unlink({
            filePath,
            success: () => {
              benchmark.log(`remove success: ${filePath}`);
              resolve(filePath);
            },
            fail(err: unknown) {
              benchmark.log(`remove fail: ${filePath}`, err);
              resolve(filePath);
            },
          });
        });
      }
    };
  },
});
