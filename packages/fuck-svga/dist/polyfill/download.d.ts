/**
 * 是否是远程链接
 * @param url 链接
 * @returns
 */
export declare const isRemote: (url: string) => boolean;
/**
 * 读取远程文件
 * @param url 文件资源地址
 * @returns
 */
export declare function readRemoteFile(url: string): Promise<ArrayBuffer>;
