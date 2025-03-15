import { Brush } from "./brush";
export declare class ImageManager {
    private pool;
    /**
     * 素材
     */
    private materials;
    getMaterials(): Map<string, Bitmap>;
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
