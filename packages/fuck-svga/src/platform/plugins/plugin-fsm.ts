import benchmark from "benchmark";
import { definePlugin } from "../definePlugin";

/**
 * 用于处理本地文件存储
 * @returns
 */
export default definePlugin<"local">({
  name: "local",
  install() {
    const { noop } = this;
    const { env, fsm } = this.global;

    if (env !== "h5") {
      return {
        write: (
          data: ArrayBuffer,
          filePath: string
        ) => {
          benchmark.log(`write file: ${filePath}`);
          return new Promise<string>((resolve, reject) => {
            fsm!.access({
              path: filePath,
              success() {
                resolve(filePath);
              },
              fail() {
                fsm!.writeFile({
                  filePath,
                  data,
                  success() {
                    resolve(filePath);
                  },
                  fail(err: unknown) {
                    benchmark.log(`write fail: ${filePath}`, err);
                    reject(err);
                  },
                });
              },
            });
          });
        },
        read: (filePath: string) => {
          return new Promise((resolve, reject) => {
            fsm!.access({
              path: filePath,
              success() {
                fsm!.readFile({
                  filePath,
                  success: (res: any) => resolve(res.data as ArrayBuffer),
                  fail: reject,
                });
              },
              fail: reject,
            });
          });
        },
        remove: (filePath: string) => {
          return new Promise((resolve) => {
            fsm!.access({
              path: filePath,
              success() {
                benchmark.log(`remove file: ${filePath}`);
                fsm!.unlink({
                  filePath,
                  success: () => resolve(filePath),
                  fail(err: unknown) {
                    benchmark.log(`remove fail: ${filePath}`, err);
                    resolve(filePath);
                  },
                });
              },
              fail(err: unknown) {
                benchmark.log(`access fail: ${filePath}`, err);
                resolve(filePath);
              },
            });
          });
        }
      };
    }

    return {
      write: noop,
      read: noop,
      remove: noop,
    }
  },
});
