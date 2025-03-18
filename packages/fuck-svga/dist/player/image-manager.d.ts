import { Brush } from "./brush";
export declare class ImageManager {
    private pool;
    /**
     * 素材
     */
    private materials;
    /**
     * 判断是不是图片
     * @param img
     * @returns
     */
    private isImage;
    /**
     * 获取图片素材
     * @returns
     */
    getMaterials(): Map<string, Bitmap>;
    /**
     * 清理素材
     */
    clear(): void;
    /**
     * 加载图片集
     * @param images 图片数据
     * @param filename 文件名称
     * @returns
     */
    loadImage(images: RawImages | PlatformImages, brush: Brush, filename: string): Promise<void>;
    /**
     * 创建图片标签
     * @returns
     */
    createImage(canvas: PlatformCanvas): PlatformImage;
}
