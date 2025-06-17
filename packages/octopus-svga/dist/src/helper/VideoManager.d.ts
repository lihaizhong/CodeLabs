export interface Bucket {
    origin: string;
    local: string;
    entity: PlatformVideo.Video | ArrayBuffer | null;
    promise: Promise<PlatformVideo.Video | null> | null;
}
export interface NeedUpdatePoint {
    action: "remove" | "add";
    start: number;
    end: number;
}
export type LoadMode = "fast" | "whole";
export declare class VideoManager {
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
     * 快速加载模式：可保证当前视频加载完成后，尽快播放；其他请求将使用Promise的方式保存在bucket中，以供后续使用
     * 完整加载模式：可保证所有视频加载完成，确保播放切换的流畅性
     */
    private loadMode;
    /**
     * 视频池的所有数据
     */
    private buckets;
    /**
     * 获取视频池大小
     */
    get length(): number;
    /**
     * 获取当前指针位置
     * @returns
     */
    get current(): number;
    /**
     * 更新留存指针位置
     */
    private updateRemainPoints;
    /**
     * 更新留存指针位置
     * @param point 最新的指针位置
     * @returns
     */
    private updateBucketOperators;
    /**
     * 获取当前的视频信息
     * @param point 最新的指针位置
     * @returns
     */
    private getBucket;
    /**
     * 创建bucket
     * @param url 远程地址
     * @param inRemainRange 是否在留存范围内
     * @param needDownloadAndParse 是否需要下载并解析
     * @returns
     */
    private createBucket;
    /**
     * 视频加载模式
     * @param loadMode
     */
    setLoadMode(loadMode: LoadMode): void;
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
     * 获取指定位置的bucket
     * @param pos
     * @returns
     */
    go(pos: number): Promise<Bucket>;
    /**
     * 清理所有的bucket
     * @returns
     */
    clear(): Promise<string[]>;
}
