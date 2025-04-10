import { platform } from "../platform";
import { Brush } from "../player/brush";

export class ImageManager {
  // FIXME: 微信小程序创建调用太多createImage会导致微信/微信小程序崩溃
  private images: PlatformImage[] = [];

  /**
   * 图片bitmap
   */
  private bitmaps: ImageBitmap[] = [];

  /**
   * 素材
   */
  private materials: Map<string, Bitmap> = new Map();

  /**
   * 获取图片素材
   * @returns
   */
  public getMaterials() {
    return this.materials;
  }

  /**
   * 加载图片集
   * @param images 图片数据
   * @param filename 文件名称
   * @returns
   */
  public async loadImages(
    images: RawImages | PlatformImages,
    brush: Brush,
    filename: string
  ): Promise<void> {
    const { env } = platform.global;
    const { load, isImage, isImageBitmap } = platform.image;
    const imageAwaits: Promise<PlatformImage | ImageBitmap>[] = [];
    const imageIns: PlatformImage[] = []
    const imageBitmapIns: ImageBitmap[] = []

    Object.keys(images).forEach((key: string) => {
      const image = images[key];

      if (isImage(image)) {
        imageIns.push(image as PlatformImage);
      } else {
        const p = load(brush, image as RawImage, filename, key).then(
          (img) => {
            this.materials.set(key, img);

            if (env !== "alipay") {
              if (isImage(img)) {
                imageIns.push(img as PlatformImage);
              } else if (isImageBitmap(img)) {
                imageBitmapIns.push(img as ImageBitmap);
              }
            }

            return img;
          }
        );

        imageAwaits.push(p);
      }
    });

    await Promise.all<PlatformImage | ImageBitmap>(imageAwaits);
    this.images = imageIns;
    this.bitmaps = imageBitmapIns;
  }

  /**
   * 创建图片标签
   * @returns
   */
  public createImage(canvas: FuckSvga.PlatformCreateImageInstance): PlatformImage {
    return this.images.shift() || platform.image.create(canvas);
  }

  /**
   * 清理素材
   */
  public clear() {
    this.materials.clear();

    for (let i = 0; i < this.images.length; i++) {
      const img = this.images[i];

      img.onload = null;
      img.onerror = null;
      img.src = "";
    }

    for (let i = 0; i < this.bitmaps.length; i++) {
      this.bitmaps[i].close();
    }

    this.bitmaps = [];
  }
}
