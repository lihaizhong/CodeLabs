export declare class ImagePool {
    /**
     * 待复用的 img 标签
     */
    private images;
    /**
     * 动态素材
     */
    dynamicMaterials: Map<string, Bitmap>;
    /**
     * 素材
     */
    materials: Map<string, Bitmap>;
    /**
     * 创建图片标签
     * @returns
     */
    createImage(): PlatformImage;
    /**
     * 加载图片集
     * @param images 图片数据
     * @param filename 文件名称
     * @returns
     */
    loadAll(images: RawImages | PlatformImages, filename: string): Promise<void[]>;
    /**
     * 更新动态素材
     * @param images
     */
    appendAll(images: PlatformImages): void;
    /**
     * 清理素材
     */
    release(): void;
}
