import { unzlibSync } from "fflate";
import { platform } from "../platform";
import { SVGADecoder } from "../extensions/protobuf";
import { VideoEntity } from "./video-entity";
import benchmark from "../benchmark";

/**
 * SVGA 下载解析器
 */
export class Parser {
  /**
   * 截取文件名称
   * @param url 
   * @returns 
   */
  static getFileName(url: string): string {
    return url.substring(url.lastIndexOf('/') + 1)
  }
  /**
   * 解析视频实体
   * @param data 视频二进制数据
   * @param url 视频地址
   * @returns
   */
  static parseVideo(data: ArrayBuffer, url: string): Video {
    const header = new Uint8Array(data, 0, 4);
    const u8a = new Uint8Array(data);

    if (header.toString() === "80,75,3,4") {
      throw new Error("this parser only support version@2 of SVGA.");
    }

    let entity: VideoEntity;
    benchmark.time("unzlibSync", () => {
      const inflateData = unzlibSync(u8a);
      const movieData = SVGADecoder.decode(inflateData);

      entity = new VideoEntity(
        movieData!,
        Parser.getFileName(url)
      );
    });

    return entity!;
  }

  /**
   * 读取文件资源
   * @param url 文件资源地址
   * @returns
   */
  public download(url: string): Promise<ArrayBuffer | null> {
    const { remote, local, global } = platform;

    // 读取远程文件
    if (remote.is(url)) {
      return remote.read(url);
    }
  
    // 读取本地文件
    if (global.env !== "h5") {
      return local.read(url);
    }
  
    return Promise.resolve(null);
  }

  /**
   * 通过 url 下载并解析 SVGA 文件
   * @param url SVGA 文件的下载链接
   * @returns Promise<SVGA 数据源
   */
  public async load(url: string): Promise<Video> {
    const data = await this.download(url);

    benchmark.label(url);
    benchmark.line();
    return Parser.parseVideo(data!, url);
  }
}
