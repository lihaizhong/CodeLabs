import { Painter } from "../../painter";
export declare class ResourceManager {
    private readonly painter;
    private static isBitmap;
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
    private createImage;
    /**
     * 加载图片集
     * @param images 图片数据
     * @param filename 文件名称
     * @returns
     */
    loadImages(images: RawImages, filename: string, prefix?: string, type?: "normal" | "dynamic"): Promise<void>;
    release(): void;
    cleanup(): void;
}
