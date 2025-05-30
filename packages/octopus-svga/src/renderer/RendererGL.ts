import { PointPool } from "./PointPool";

export class RendererGL implements PlatformRenderer {
  private pointPool: PointPool = new PointPool();

  private globalTransform?: PlatformVideo.Transform = void 0;

  constructor(context: WebGLRenderingContext) {}

  getGlobalTransform(): PlatformVideo.Transform | undefined {
    return this.globalTransform;
  }

  setGlobalTransform(transform?: PlatformVideo.Transform): void {
    this.globalTransform = transform;
  }

  render(
    videoEntity: PlatformVideo.Video,
    materials: Map<string, OctopusPlatform.Bitmap>,
    dynamicMaterials: Map<string, OctopusPlatform.Bitmap>,
    currentFrame: number,
    head: number,
    tail: number
  ): void {}
}
