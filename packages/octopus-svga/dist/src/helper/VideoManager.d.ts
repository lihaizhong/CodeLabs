export interface Bucket {
    origin: string;
    local: string;
    entity: PlatformVideo.Video | null;
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
    decompress: (url: string, buff: ArrayBufferLike) => Promise<ArrayBufferLike> | ArrayBufferLike;
    parse: (url: string, buff: ArrayBufferLike) => Promise<PlatformVideo.Video> | PlatformVideo.Video;
}
export declare class VideoManager {
    /**
     * 将文件写入用户目录中
     * @param bucket
     * @param buff
     */
    private static writeFileToUserDirectory;
    /**
     * 从用户目录中移除文件
     * @param bucket
     * @returns
     */
    private static removeFileFromUserDirectory;
    /**
     * 视频池的当前指针位置
     */
    private point;
    /**
     * 视频的最大留存数量，其他视频将放在磁盘上缓存
     */
    private maxRemain;
    /**
     * 留存视频的开始指针位置
     */
    private remainStart;
    /**
     * 留存视频的结束指针位置
     */
    private remainEnd;
    /**
     * 视频加载模式
     * - 快速加载模式：可保证当前视频加载完成后，尽快播放；其他请求将使用Promise的方式保存在bucket中，以供后续使用
     * - 完整加载模式：可保证所有视频加载完成，确保播放切换的流畅性
     */
    private loadMode;
    /**
     * 视频池的所有数据
     */
    private buckets;
    private readonly options;
    /**
     * 获取视频池大小
     */
    get size(): number;
    constructor(loadMode: LoadMode, options?: VideoManagerOptions);
    /**
     * 更新留存指针位置
     */
    private updateRemainRange;
    /**
     * 指针是否在留存空间内
     * @param point
     * @returns
     */
    private includeRemainRange;
    private downloadAndParseVideo;
    /**
     * 创建bucket
     * @param url 远程地址
     * @param point 指针位置
     * @param needDownloadAndParse 是否需要下载并解析
     * @returns
     */
    private createBucket;
    /**
     * 预加载视频到本地磁盘中
     * @param urls 视频远程地址
     * @param point 当前指针位置
     * @param maxRemain 最大留存数量
     */
    prepare(urls: string[], point?: number, maxRemain?: number): Promise<void>;
    /**
     * 获取当前帧的bucket
     * @returns
     */
    get(): Promise<Bucket>;
    /**
     * 获取当前的指针位置
     * @returns
     */
    getPoint(): number;
    /**
     * 获取指定位置的bucket
     * @param pos
     * @returns
     */
    go(point: number): Promise<Bucket>;
    /**
     * 清理所有的bucket
     * @returns
     */
    clear(): Promise<void>;
}
