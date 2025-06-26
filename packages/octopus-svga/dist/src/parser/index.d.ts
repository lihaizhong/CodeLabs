/**
 * SVGA 下载解析器
 */
export declare class Parser {
    static decompress(data: ArrayBuffer | SharedArrayBuffer | ArrayBufferLike): ArrayBuffer | SharedArrayBuffer | ArrayBufferLike;
    /**
     * 解析视频实体
     * @param data 视频二进制数据
     * @param url 视频地址
     * @returns
     */
    static parseVideo(data: ArrayBuffer | SharedArrayBuffer | ArrayBufferLike, url: string, decompression?: boolean): PlatformVideo.Video;
    /**
     * 读取文件资源
     * @param url 文件资源地址
     * @returns
     */
    static download(url: string): Promise<ArrayBuffer>;
    /**
     * 通过 url 下载并解析 SVGA 文件
     * @param url SVGA 文件的下载链接
     * @returns Promise<SVGA 数据源
     */
    static load(url: string): Promise<PlatformVideo.Video>;
}
