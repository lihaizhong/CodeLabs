export declare function genFilePath(filename: string, prefix?: string): string;
/**
 * 写入本地文件
 * @param data 文件内容
 * @param filePath 文件路径
 * @returns
 */
export declare function writeFile(data: ArrayBuffer, filePath: string): Promise<string>;
/**
 * 移除本地文件
 * @param filePath 文件资源地址
 * @returns
 */
export declare function removeFile(filePath: string): Promise<string>;
/**
 * 读取本地文件
 * @param filePath 文件资源地址
 * @returns
 */
export declare function readFile(filePath: string): Promise<ArrayBuffer>;
