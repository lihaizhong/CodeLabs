
interface RawImages {
  [key: string]: OctopusPlatform.RawImage;
}

interface PlatformImages {
  [key: string]: OctopusPlatform.Bitmap;
}

interface PlatformRenderer {
  getGlobalTransform(): PlatformVideo.Transform | undefined;

  setGlobalTransform(transform: PlatformVideo.Transform): void;

  render(
    videoEntity: PlatformVideo.Video,
    materials: Map<string, OctopusPlatform.Bitmap>,
    dynamicMaterials: Map<string, OctopusPlatform.Bitmap>,
    currentFrame: number,
    head: number,
    tail: number
  ): void;
}