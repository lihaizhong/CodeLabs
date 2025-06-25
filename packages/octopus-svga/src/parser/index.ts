// import { unzlibSync } from "fflate";
import { unzlibSync, createVideoEntity } from "../extensions";
import { platform } from "../platform";

/**
 * SVGA 下载解析器
 */
export class Parser {
  /**
   * 解析视频实体
   * @param data 视频二进制数据
   * @param url 视频地址
   * @returns
   */
  static parseVideo(
    data: ArrayBuffer | SharedArrayBuffer | ArrayBufferLike,
    url: string,
    decompression: boolean = true
  ): PlatformVideo.Video {
    const u8a = new Uint8Array(data);

    return createVideoEntity(
      decompression ? unzlibSync(u8a) : u8a,
      platform.path.filename(url)
    );
  }

  /**
   * 读取文件资源
   * @param url 文件资源地址
   * @returns
   */
  static download(url: string): Promise<ArrayBuffer | null> {
    const { remote, local, globals } = platform;

    // 读取远程文件
    if (remote.is(url)) {
      return remote.fetch(url);
    }

    // 读取本地文件
    if (globals.env !== "h5") {
      return local!.read(url);
    }

    return Promise.resolve(null);
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
