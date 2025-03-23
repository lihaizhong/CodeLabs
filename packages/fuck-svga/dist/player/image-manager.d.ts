import { Brush } from "./brush";
export declare class ImageManager {
    private images;
    private bitmaps;
    /**
     * 素材
     */
    private materials;
    /**
     * 判断是不是Image实例
     * @param img
     * @returns
     */
    private isImage;
    /**
     * 判断是不是ImageBitmap实例
     * @param img
     * @returns
     */
    private isImageBitmap;
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
    createImage(canvas: PlatformCanvas): PlatformImage;
    /**
     * 清理素材
     */
    clear(): void;
}
