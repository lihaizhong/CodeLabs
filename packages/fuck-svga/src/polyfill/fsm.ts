import { br } from "./bridge";
import { Env, SE } from "../env";
import benchmark from "../benchmark";

const { USER_DATA_PATH = '' } =
  Env.is(SE.H5)
    ? {}
    : Env.is(SE.DOUYIN)
    ? // @ts-ignore
      tt.getEnvInfoSync().common
    : (br as WechatMiniprogram.Wx).env;

export function genFilePath(filename: string, prefix?: string) {
  return `${USER_DATA_PATH}/${prefix ? `${prefix}.` : ""}${filename}`;
}

let fsm: WechatMiniprogram.FileSystemManager | null = null;

function getFileSystemManager() {
  if (fsm === null) {
    fsm = (br as WechatMiniprogram.Wx).getFileSystemManager();
  }
}

/**
 * 写入本地文件
 * @param data 文件内容
 * @param filePath 文件路径
 * @returns
 */
export function writeTmpFile(
  data: ArrayBuffer,
  filePath: string
): Promise<string> {
  getFileSystemManager();
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
          fail(err: any) {
            benchmark.log(`write fail: ${filePath}`, err);
            reject(err);
          },
        });
      },
    });
  });
}

/**
 * 移除本地文件
 * @param filePath 文件资源地址
 * @returns
 */
export function removeTmpFile(filePath: string): Promise<string> {
  getFileSystemManager();
  return new Promise((resolve) => {
    fsm!.access({
      path: filePath,
      success() {
        benchmark.log(`remove file: ${filePath}`);
        fsm!.unlink({
          filePath,
          success: () => resolve(filePath),
          fail(err: any) {
            benchmark.log(`remove fail: ${filePath}`, err);
            resolve(filePath);
          },
        });
      },
      fail(err: any) {
        benchmark.log(`access fail: ${filePath}`, err);
        resolve(filePath);
      },
    });
  });
}

/**
 * 读取本地文件
 * @param filePath 文件资源地址
 * @returns
 */
export function readFile(filePath: string): Promise<ArrayBuffer> {
  getFileSystemManager();
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
}
