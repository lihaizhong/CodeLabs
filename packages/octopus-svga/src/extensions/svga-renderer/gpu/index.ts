import type { Bitmap } from "octopus-platform";
import type { PlatformVideo } from "../../../types";

export class RendererGPU {
  render(
    videoEntity: PlatformVideo.Video,
    materials: Map<string, Bitmap>,
    dynamicMaterials: Map<string, Bitmap>,
    currentFrame: number,
    head: number,
    tail: number
  ): void {}
}
