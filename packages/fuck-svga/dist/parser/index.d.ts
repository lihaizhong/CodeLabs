/**
 * SVGA 下载解析器
 */
export declare class Parser {
    /**
     * 截取文件名称
     * @param url
     * @returns
     */
    static getFileName(url: string): string;
    /**
     * 解析视频实体
     * @param data 视频二进制数据
     * @param url 视频地址
     * @returns
     */
    static parseVideo(data: ArrayBuffer, url: string): Video;
    /**
     * 读取文件资源
     * @param url 文件资源地址
     * @returns
     */
    download(url: string): Promise<ArrayBuffer | null>;
    /**
     * 通过 url 下载并解析 SVGA 文件
     * @param url SVGA 文件的下载链接
     * @returns Promise<SVGA 数据源
     */
    load(url: string): Promise<Video>;
}
