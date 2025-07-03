import { Painter } from "../core/painter";
export declare class ResourceManager {
    private readonly painter;
    /**
     * 判断是否是 ImageBitmap
     * @param img
     * @returns
     */
    private static isBitmap;
    /**
     * 释放内存资源（图片）
     * @param img
     */
    private static releaseOne;
    private caches;
    /**
     * 动态素材
     */
    readonly dynamicMaterials: Map<string, OctopusPlatform.Bitmap>;
    /**
     * 素材
     */
    readonly materials: Map<string, OctopusPlatform.Bitmap>;
    /**
     * 已清理Image对象的坐标
     */
    private point;
    constructor(painter: Painter);
    /**
     * 创建图片标签
     * @returns
     */
    private createImage;
    /**
     * 将 ImageBitmap 插入到 caches
     * @param img
     */
    private inertBitmapIntoCaches;
    /**
     * 加载额外的图片资源
     * @param source 资源内容/地址
     * @param filename 文件名称
     * @returns
     */
    loadExtImage(source: string | Uint8Array, filename: string): Promise<OctopusPlatform.PlatformImage | ImageBitmap>;
    /**
     * 加载图片集
     * @param images 图片数据
     * @param filename 文件名称
     * @returns
     */
    loadImagesWithRecord(images: RawImages, filename: string, type?: "normal" | "dynamic"): Promise<void>;
    /**
     * 释放图片资源
     */
    release(): void;
    /**
     * 整理图片资源，将重复的图片资源移除
     */
    private tidyUp;
    /**
     * 清理图片资源
     */
    cleanup(): void;
}
