import { platform } from "../platform";
import { Parser } from "../parser";
import benchmark from "src/benchmark";

export interface Bucket {
  // 远程地址
  origin: string;
  // 本地地址
  local: string;
  // 实例
  entity: PlatformVideo.Video | null;
  // 下载实例中
  promise: Promise<ArrayBufferLike> | null;
}

export interface NeedUpdatePoint {
  action: "remove" | "add";
  start: number;
  end: number;
}

export type LoadMode = "fast" | "whole";

export interface VideoManagerOptions {
  download: (url: string) => Promise<ArrayBufferLike>;
  decompress: (url: string, buff: ArrayBufferLike) => Promise<ArrayBufferLike>;
  parse: (url: string, buff: ArrayBufferLike) => PlatformVideo.Video;
}

export type Decompress = (
  url: string,
  buff: ArrayBufferLike
) => Promise<ArrayBufferLike> | ArrayBufferLike;

export class VideoManager {
  /**
   * 将文件写入用户目录中
   * @param bucket
   * @param buff
   */
  private static async writeFileToUserDirectory(
    bucket: Bucket,
    buff: ArrayBufferLike
  ): Promise<void> {
    const { globals, path, local } = platform;
    const { env } = globals;

    if (env === "h5" || env === "tt" || !path.is(bucket.local)) {
      return;
    }

    try {
      const filepath = path.resolve(path.filename(bucket.origin), "full");

      await local!.write(buff, filepath);
      bucket.local = filepath;
    } catch (ex) {
      // eslint-disable-next-line no-console
      console.error(ex);
    }
  }

  /**
   * 从用户目录中移除文件
   * @param bucket
   * @returns
   */
  private static async removeFileFromUserDirectory(bucket: Bucket) {
    const { globals, path, local } = platform;
    const { env } = globals;

    if (env === "h5" || env === "tt" || !path.is(bucket.local)) {
      return;
    }

    try {
      await local!.remove(bucket.local);
      bucket.local = "";
    } catch (ex) {
      // eslint-disable-next-line no-console
      console.error(ex);
    }
  }

  /**
   * 视频池的当前指针位置
   */
  private point: number = 0;
  /**
   * 视频的最大留存数量，其他视频将放在磁盘上缓存
   */
  private maxRemain: number = 3;
  /**
   * 留存视频的开始指针位置
   */
  private remainStart: number = 0;
  /**
   * 留存视频的结束指针位置
   */
  private remainEnd: number = 0;
  /**
   * 视频加载模式
   * - 快速加载模式：可保证当前视频加载完成后，尽快播放；其他请求将使用Promise的方式保存在bucket中，以供后续使用
   * - 完整加载模式：可保证所有视频加载完成，确保播放切换的流畅性
   */
  private loadMode: LoadMode = "fast";
  /**
   * 视频池的所有数据
   */
  private buckets: Bucket[] = [];

  private readonly options: VideoManagerOptions = {
    /**
     * 下载动效数据
     * @param url
     * @returns
     */
    download: (url: string) =>
      benchmark.time(`${url} 下载时间`, () =>
        Parser.download(url)
      ) as Promise<ArrayBufferLike>,
    /**
     * 解压动效数据
     * @param buff
     * @returns
     */
    decompress: (url: string, buff: ArrayBufferLike) =>
      benchmark.time(`${url} 解压时间`, () =>
        Parser.decompress(buff)
      ) as Promise<ArrayBufferLike>,
    parse: (url: string, buff: ArrayBufferLike) =>
      benchmark.time(`${url} 解析时间`, () =>
        Parser.parseVideo(buff, url, false)
      ) as PlatformVideo.Video,
  };

  /**
   * 获取视频池大小
   */
  get size(): number {
    return this.buckets.length;
  }

  constructor(loadMode: LoadMode, options?: VideoManagerOptions) {
    if (typeof loadMode === "string") {
      this.loadMode = loadMode;
    }

    Object.assign(this.options, options);
  }

  /**
   * 更新留存指针位置
   */
  private updateRemainRange(
    point?: number,
    maxRemain?: number,
    totalCount: number = this.buckets.length
  ): void {
    if (typeof point === "number") {
      if (point < 0) {
        this.point = 0;
      } else if (point > totalCount) {
        this.point = totalCount - 1;
      } else {
        this.point = point;
      }
    } else {
      this.point = 0;
    }

    if (typeof maxRemain === "number") {
      if (maxRemain < 1) {
        this.maxRemain = 1;
      } else if (maxRemain > totalCount) {
        this.maxRemain = totalCount;
      } else {
        this.maxRemain = 3;
      }
    } else {
      this.maxRemain = 3;
    }

    this.remainStart = Math.max(0, this.point - Math.ceil(this.maxRemain / 2));
    this.remainEnd = this.remainStart + this.maxRemain;

    if (this.remainEnd > totalCount) {
      this.remainEnd = this.remainEnd % totalCount;
    }
  }

  /**
   * 更新留存指针位置
   * @param point 最新的指针位置
   * @returns
   */
  private updateRemainOperations(point: number): NeedUpdatePoint[] {
    const { remainStart: latestRemainStart, remainEnd: latestRemainEnd } = this;
    const createOperation = (
      action: "add" | "remove",
      start: number,
      end: number
    ) => ({ action, start, end });

    this.updateRemainRange(point);
    if (latestRemainStart === latestRemainEnd) {
      return [createOperation("add", this.remainStart, this.remainEnd)];
    }

    if (
      this.remainStart > latestRemainEnd ||
      this.remainEnd < latestRemainStart
    ) {
      return [
        createOperation("remove", latestRemainStart, latestRemainEnd),
        createOperation("add", this.remainStart, this.remainEnd),
      ];
    }

    if (
      this.remainStart > latestRemainStart &&
      this.remainEnd > latestRemainEnd
    ) {
      return [
        createOperation("remove", latestRemainStart, this.remainStart),
        createOperation("add", latestRemainEnd, this.remainEnd),
      ];
    }

    if (
      this.remainStart < latestRemainStart &&
      this.remainEnd < latestRemainEnd
    ) {
      return [
        createOperation("remove", this.remainEnd, latestRemainEnd),
        createOperation("add", this.remainStart, latestRemainStart),
      ];
    }

    return [];
  }

  private async downloadAndParseVideo(
    bucket: Bucket,
    needParse?: false
  ): Promise<ArrayBufferLike>;
  private async downloadAndParseVideo(
    bucket: Bucket,
    needParse: true
  ): Promise<PlatformVideo.Video>;
  private async downloadAndParseVideo(
    bucket: Bucket,
    needParse: boolean = false
  ) {
    const { options } = this;
    const rawData = await options.download(bucket.local || bucket.origin);
    const data = await options.decompress(bucket.origin, rawData);

    VideoManager.writeFileToUserDirectory(bucket, rawData);
    if (needParse) {
      return options.parse(bucket.origin, data);
    }

    return data;
  }

  /**
   * 创建bucket
   * @param url 远程地址
   * @param inRemainRange 是否在留存范围内
   * @param needDownloadAndParse 是否需要下载并解析
   * @returns
   */
  private async createBucket(
    url: string,
    inRemainRange: boolean,
    needDownloadAndParse: boolean
  ): Promise<Bucket> {
    const bucket: Bucket = {
      origin: url,
      local: "",
      entity: null,
      promise: null,
    };

    if (inRemainRange) {
      if (needDownloadAndParse) {
        bucket.entity = await this.downloadAndParseVideo(bucket, true);
      } else {
        bucket.promise = this.downloadAndParseVideo(bucket);
      }
    }

    return bucket;
  }

  /**
   * 预加载视频到本地磁盘中
   * @param urls 视频远程地址
   * @param point 当前指针位置
   * @param maxRemain 最大留存数量
   */
  async prepare(
    urls: string[],
    point?: number,
    maxRemain?: number
  ): Promise<void> {
    this.updateRemainRange(point, maxRemain, urls.length);

    const { loadMode, remainStart, remainEnd, point: currentPoint } = this;
    // 优先加载当前动效
    const preloadBucket: Bucket = await this.createBucket(
      urls[currentPoint],
      true,
      true
    );

    this.buckets = await Promise.all(
      urls.map((url: string, index: number) => {
        // 当前帧的视频已经预加载到内存中
        if (index === currentPoint) {
          return preloadBucket;
        }

        return this.createBucket(
          url,
          remainStart <= index && index < remainEnd,
          loadMode === "whole"
        );
      })
    );
  }

  /**
   * 获取指定位置的bucket
   * @param pos
   * @returns
   */
  async go(point: number): Promise<Bucket> {
    const { size, buckets, loadMode } = this;

    if (point < 0 || point >= size) {
      return buckets[point];
    }

    const operators = this.updateRemainOperations(point);
    if (operators.length) {
      const waitings: Promise<ArrayBufferLike | null>[] = [];
      operators.forEach(({ action, start, end }) => {
        const loopEnd = end < start ? size + end : end;
        for (let i = start; i < loopEnd; i++) {
          const bucket = buckets[i % size];
          if (action === "remove") {
            bucket.entity = null;
            bucket.promise = null;
          } else if (action === "add") {
            if (bucket.entity === null) {
              if (bucket.promise === null) {
                bucket.promise = this.downloadAndParseVideo(bucket);
              }

              if (loadMode === "whole" || point === i) {
                waitings.push(bucket.promise);
              }
            }
          }
        }
      });
      await Promise.all(waitings);
    }

    return this.get();
  }

  /**
   * 获取当前帧的bucket
   * @returns
   */
  async get(): Promise<Bucket> {
    const bucket = this.buckets[this.point];

    if (bucket.promise) {
      bucket.entity = await bucket.promise.then((data: ArrayBufferLike) =>
        this.options.parse(bucket.origin, data)
      );
      bucket.promise = null;
    } else if (!bucket.entity) {
      bucket.entity = await this.downloadAndParseVideo(bucket, true);
    }

    return bucket;
  }

  /**
   * 获取当前的指针位置
   * @returns
   */
  getPoint(): number {
    return this.point;
  }

  /**
   * 清理所有的bucket
   * @returns
   */
  async clear(): Promise<void> {
    const { buckets } = this;

    this.point = 0;
    this.remainStart = 0;
    this.remainEnd = 0;
    this.maxRemain = 3;
    this.buckets = [];

    await Promise.all(buckets.map(VideoManager.removeFileFromUserDirectory));
  }
}
