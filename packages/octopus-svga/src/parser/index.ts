// import { unzlibSync } from "fflate";
import { unzlibSync, createVideoEntity, calculateHash } from "../extensions";
import { platform } from "../platform";

/**
 * SVGA 下载解析器
 */
export class Parser {
  static hash(buff: ArrayBufferLike) {
    const view = new Uint8Array(buff);
    const step = Math.max(1, Math.floor(view.byteLength / 100));

    return calculateHash(view, 0, view.byteLength, step);
  }
  
  static decompress(data: ArrayBufferLike): ArrayBufferLike {
    return unzlibSync(new Uint8Array(data)).buffer;
  }

  /**
   * 解析视频实体
   * @param data 视频二进制数据
   * @param url 视频地址
   * @returns
   */
  static parseVideo(
    data: ArrayBufferLike,
    url: string,
    decompression: boolean = true
  ): PlatformVideo.Video {
    return createVideoEntity(
      new Uint8Array(decompression ? this.decompress(data) : data),
      platform.path.filename(url)
    );
  }

  /**
   * 读取文件资源
   * @param url 文件资源地址
   * @returns
   */
  static download(url: string): Promise<ArrayBufferLike> {
    const { remote, path, local, globals } = platform;

    // 读取本地文件
    if (globals.env !== "h5" && path.is(url)) {
      return local!.read(url);
    }

    // 读取远程文件
    return remote.fetch(url);
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
