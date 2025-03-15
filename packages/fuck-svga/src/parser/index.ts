import { unzlibSync } from "fflate";
import { MovieEntity } from "fuck-protobuf";
import { Env, SE } from "env";
import { readFile } from "../polyfill";
import { isRemote, readRemoteFile } from "../polyfill/download";
import { VideoEntity } from "./video-entity";
import benchmark from "../benchmark";

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
  static parseVideo(data: ArrayBuffer, url: string): Video {
    const header = new Uint8Array(data, 0, 4);
    const u8a = new Uint8Array(data);

    if (header.toString() === "80,75,3,4") {
      throw new Error("this parser only support version@2 of SVGA.");
    }

    let entity: VideoEntity;
    benchmark.time("unzlibSync", () => {
      const inflateData = unzlibSync(u8a);
      const movieData = MovieEntity.decode(inflateData);

      entity = new VideoEntity(
        movieData!,
        url.substring(url.lastIndexOf("/") + 1)
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
    // 读取远程文件
    if (isRemote(url)) {
      return readRemoteFile(url);
    }
  
    // 读取本地文件
    if (Env.not(SE.H5)) {
      return readFile(url);
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
