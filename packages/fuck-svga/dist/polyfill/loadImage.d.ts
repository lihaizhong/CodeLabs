/**
 * 加载图片
 * @param brush 创建图片对象
 * @param data 图片数据
 * @param filename 图片名称
 * @param prefix 文件名称前缀
 * @returns
 */
export declare function loadImage(brush: {
    createImage: () => PlatformImage;
}, data: ImageBitmap | Uint8Array | string, filename: string, prefix?: string): Promise<PlatformImage | ImageBitmap>;
