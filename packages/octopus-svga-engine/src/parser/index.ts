// import { unzlibSync } from "fflate";
import { unzlibSync, createVideoEntity } from "../../extensions";
import { platform } from "../../platform";
import type { PlatformVideo } from "../../types";

/**
 * SVGA 下载解析器
 */
export class Parser {
  /**
   * 解压视频源文件
   * @param data
   * @returns
   */
  static decompress(data: ArrayBufferLike): ArrayBufferLike {
    return unzlibSync(new Uint8Array(data)).buffer;
  }

  /**
   * 解析视频实体
   * @param data 视频二进制数据
   * @param url 视频地址
   * @param needDecompress 是否解压
   * @returns
   */
  static parseVideo(
    data: ArrayBufferLike,
    url: string,
    needDecompress: boolean = true
  ): PlatformVideo.Video {
    return createVideoEntity(
      new Uint8Array(needDecompress ? this.decompress(data) : data),
      platform.path.filename(url)
    );
  }

  /**
   * 读取文件资源
   * @param url 文件资源地址
   * @returns
   */
  static async download(url: string): Promise<ArrayBuffer> {
    const { globals, remote, path, local } = platform;
    const { env } = globals;
    const supportLocal = env !== "h5" && env !== "tt";
    const filepath = path.is(url)
        ? url
        : path.resolve(path.filename(url));

    // 本地读取
    if (supportLocal) {
      if (await local!.exists(filepath)) {
        return local!.read(filepath);
      }
    }

    // 远程读取
    const buff = await remote.fetch(url);

    // 本地缓存
    if (supportLocal) {
      try {
        await local!.write(buff, filepath);
      } catch (ex) {
        // eslint-disable-next-line no-console
        console.error(ex);
      }
    }

    return buff;
  }

  /**
   * 通过 url 下载并解析 SVGA 文件
   * @param url SVGA 文件的下载链接
   * @returns Promise<SVGA 数据源
   */
  static async load(url: string): Promise<PlatformVideo.Video> {
    return Parser.parseVideo((await Parser.download(url))!, url);
  }
}
