export declare class RendererGL implements PlatformRenderer {
    private pointPool;
    private globalTransform?;
    constructor(context: WebGLRenderingContext);
    getGlobalTransform(): PlatformVideo.Transform | undefined;
    setGlobalTransform(transform?: PlatformVideo.Transform): void;
    render(videoEntity: PlatformVideo.Video, materials: Map<string, OctopusPlatform.Bitmap>, dynamicMaterials: Map<string, OctopusPlatform.Bitmap>, currentFrame: number, head: number, tail: number): void;
}
