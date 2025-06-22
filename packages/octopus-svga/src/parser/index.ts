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
  static parseVideo(data: ArrayBuffer, url: string): PlatformVideo.Video {
    const u8a = new Uint8Array(data);

    if (u8a.subarray(0, 4).toString() === "80,75,3,4") {
      throw new Error("this parser only support version@2 of SVGA.");
    }

    return createVideoEntity(unzlibSync(u8a), platform.path.filename(url));
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
