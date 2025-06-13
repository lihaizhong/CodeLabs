export declare class ImageCaches implements OctopusPlatform.ImageCaches {
    private caches;
    private point;
    getImage(): OctopusPlatform.PlatformImage | null;
    getCaches(): (OctopusPlatform.PlatformImage | ImageBitmap)[];
    push(img: OctopusPlatform.PlatformImage | ImageBitmap): void;
    tidy(): void;
    cleanup(): void;
}
