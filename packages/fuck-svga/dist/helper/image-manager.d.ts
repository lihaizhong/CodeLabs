import { Brush } from "../player/brush";
export declare class ImageManager {
    /**
     * 待复用的 img 标签
     */
    private images;
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
    createImage(canvas: FuckSvga.PlatformCreateImageInstance): PlatformImage;
    /**
     * 释放图片标签
     * @param image
     */
    appendCleanedImage(image: Bitmap | PlatformCanvas): void;
    /**
     * 清理重复的图片标签
     */
    tidyUp(): void;
    /**
     * 清理素材
     */
    clear(): void;
}
