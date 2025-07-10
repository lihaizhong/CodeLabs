// import { unzlibSync } from "fflate";
import { unzlibSync, createVideoEntity, calculateHash } from "../../extensions";
import { platform } from "../platform";
import type { PlatformVideo } from "../../types";

/**
 * SVGA 下载解析器
 */
export class Parser {
  static hash(buff: ArrayBufferLike) {
    const view = new Uint8Array(buff);

    return calculateHash(
      view,
      0,
      view.byteLength,
      Math.max(1, Math.floor(view.byteLength / 100))
    );
  }

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
  static download(url: string): Promise<ArrayBuffer> {
    const { remote, path, local } = platform;

    return path.is(url) ? local!.read(url) : remote.fetch(url);
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
