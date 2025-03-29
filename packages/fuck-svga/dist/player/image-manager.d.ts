import { Brush } from "./brush";
export declare class ImageManager {
    private images;
    /**
     * 图片bitmap
     */
    private bitmaps;
    /**
     * 素材
     */
    private materials;
    /**
     * 获取图片素材
     * @returns
     */
    getMaterials(): Map<string, Bitmap>;
    /**
     * 加载图片集
     * @param images 图片数据
     * @param filename 文件名称
     * @returns
     */
    loadImages(images: RawImages | PlatformImages, brush: Brush, filename: string): Promise<void>;
    /**
     * 创建图片标签
     * @returns
     */
    createImage(canvas: PlatformCreateImageInstance): PlatformImage;
    /**
     * 清理素材
     */
    clear(): void;
}
