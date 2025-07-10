import benchmark from "octopus-benchmark";
import { platform } from "../core/platform";
import { Parser } from "../core/parser";
import type { PlatformVideo } from "../types/video";

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
  preprocess: (bucket: Bucket) => Promise<ArrayBufferLike>;
  postprocess: (
    bucket: Bucket,
    buff: ArrayBufferLike
  ) => Promise<PlatformVideo.Video> | PlatformVideo.Video;
}

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
    const { path, local } = platform;

    if (path.is(bucket.local)) {
      try {
        await local!.write(buff, bucket.local);
      } catch (ex) {
        // eslint-disable-next-line no-console
        console.error(ex);
      }
    }
  }

  /**
   * 从用户目录中移除文件
   * @param bucket
   * @returns
   */
  private static async removeFileFromUserDirectory(bucket: Bucket) {
    const { path, local } = platform;

    if (path.is(bucket.local)) {
      try {
        await local!.remove(bucket.local);
      } catch (ex) {
        // eslint-disable-next-line no-console
        console.error(ex);
      }
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
     * 预处理动效数据
     * @param url
     * @returns
     */
    preprocess: async (bucket: Bucket) => {
      const { local, remote } = platform;

      if (local && (await local.exists(bucket.local))) {
        return benchmark.time<ArrayBuffer>(`${bucket.local} 读取时间`, () =>
          local.read(bucket.local)
        );
      }

      return benchmark.time<ArrayBuffer>(`${bucket.origin} 下载时间`, () =>
        remote.fetch(bucket.origin)
      );
    },
    /**
     * 后处理动效数据
     * @param data
     * @returns
     */
    postprocess: (bucket: Bucket, data: ArrayBufferLike) =>
      benchmark.time<PlatformVideo.Video>(`${bucket.origin} 解析时间`, () =>
        Parser.parseVideo(data, bucket.origin, true)
      ),
  };

  /**
   * 获取视频池大小
   */
  get size(): number {
    return this.buckets.length;
  }

  constructor(loadMode: LoadMode, options?: Partial<VideoManagerOptions>) {
    if (typeof loadMode === "string") {
      this.loadMode = loadMode;
    }

    Object.assign(this.options, options);
  }

  /**
   * 更新留存指针位置
   */
  private updateRemainRange(
    point: number,
    maxRemain: number,
    totalCount: number
  ): void {
    if (point < 0) {
      this.point = 0;
    } else if (point >= totalCount) {
      this.point = totalCount - 1;
    } else {
      this.point = point;
    }

    if (this.loadMode === "whole") {
      this.remainStart = 0;
      this.remainEnd = totalCount;
    } else {
      if (maxRemain < 1) {
        this.maxRemain = 1;
      } else if (maxRemain > totalCount) {
        this.maxRemain = totalCount;
      } else {
        this.maxRemain = maxRemain;
      }

      this.remainStart = this.point - Math.floor(this.maxRemain / 2);
      if (this.remainStart < 0) {
        this.remainStart = totalCount + this.remainStart;
      }

      this.remainEnd = this.remainStart + this.maxRemain;
      if (this.remainEnd > totalCount) {
        this.remainEnd = this.remainEnd % totalCount;
      }
    }
  }

  /**
   * 指针是否在留存空间内
   * @param point
   * @returns
   */
  private includeRemainRange(point: number): boolean {
    if (this.remainStart < this.remainEnd) {
      return point >= this.remainStart && point < this.remainEnd;
    }

    if (this.remainStart > this.remainEnd) {
      return point >= this.remainStart || point < this.remainEnd;
    }

    return true;
  }

  private async downloadAndParseVideo(
    bucket: Bucket,
    needParse?: false
  ): Promise<ArrayBuffer>;
  private async downloadAndParseVideo(
    bucket: Bucket,
    needParse: true
  ): Promise<PlatformVideo.Video>;
  private async downloadAndParseVideo(
    bucket: Bucket,
    needParse: boolean = false
  ) {
    const { options } = this;
    const data = await options.preprocess(bucket);

    VideoManager.writeFileToUserDirectory(bucket, data);
    if (needParse) {
      return options.postprocess(bucket, data);
    }

    return data;
  }

  /**
   * 创建bucket
   * @param url 远程地址
   * @param point 指针位置
   * @param needDownloadAndParse 是否需要下载并解析
   * @returns
   */
  private async createBucket(
    url: string,
    point: number,
    needDownloadAndParse: boolean
  ): Promise<Bucket> {
    const { path } = platform;
    const bucket: Bucket = {
      origin: url,
      local: path.resolve(path.filename(url), "full"),
      entity: null,
      promise: null,
    };

    this.buckets[point] = bucket;
    if (needDownloadAndParse) {
      bucket.entity = await this.downloadAndParseVideo(bucket, true);
    } else if (this.includeRemainRange(point)) {
      bucket.promise = this.downloadAndParseVideo(bucket);
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
    point: number = 0,
    maxRemain: number = 3
  ): Promise<void> {
    this.updateRemainRange(point, maxRemain, urls.length);

    const { loadMode, point: currentPoint } = this;
    // 优先加载当前动效
    const preloadBucket: Bucket = await this.createBucket(
      urls[currentPoint],
      currentPoint,
      true
    );

    await benchmark.time("资源加载时间", () =>
      Promise.all(
        urls.map((url: string, index: number) => {
          // 当前帧的视频已经预加载到内存中
          if (index === currentPoint) {
            return preloadBucket;
          }

          return this.createBucket(url, index, loadMode === "whole");
        })
      )
    );
  }

  /**
   * 获取当前帧的bucket
   * @returns
   */
  async get(): Promise<Bucket> {
    const bucket = this.buckets[this.point];

    if (bucket.promise) {
      bucket.entity = await bucket.promise.then((data: ArrayBufferLike) =>
        this.options.postprocess(bucket, data)
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
   * 获取指定位置的bucket
   * @param pos
   * @returns
   */
  async go(point: number): Promise<Bucket> {
    const { size, buckets, loadMode } = this;

    if (point < 0 || point >= size) {
      return buckets[this.point];
    }

    this.updateRemainRange(point, this.maxRemain, buckets.length);
    if (loadMode === "fast" && this.maxRemain !== buckets.length) {
      buckets.forEach((bucket: Bucket, index: number) => {
        if (this.includeRemainRange(index)) {
          if (bucket.entity === null && bucket.promise === null) {
            bucket.promise = this.downloadAndParseVideo(bucket);
          }
        } else {
          bucket.entity = null;
          bucket.promise = null;
        }
      });
    }

    return this.get();
  }

  /**
   * 清理所有的bucket
   * @returns
   */
  async clear(needRemoveFiles: boolean = true): Promise<void> {
    const { buckets } = this;

    this.point = 0;
    this.remainStart = 0;
    this.remainEnd = 0;
    this.maxRemain = 3;
    this.buckets = [];

    if (needRemoveFiles) {
      await Promise.all(buckets.map(VideoManager.removeFileFromUserDirectory));
    }
  }
}
