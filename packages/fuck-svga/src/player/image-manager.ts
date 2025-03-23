import { Env, SE } from "../env";
import { loadImage } from "../polyfill";
import { Brush } from "./brush";

export class ImageManager {
  // FIXME: 微信小程序创建调用太多createImage会导致微信/微信小程序崩溃
  private images: PlatformImage[] = [];

  private bitmaps: ImageBitmap[] = [];

  /**
   * 素材
   */
  private materials: Map<string, Bitmap> = new Map();

  /**
   * 判断是不是Image实例
   * @param img
   * @returns
   */
  private isImage(img: any) {
    return (
      (Env.is(SE.H5) && img instanceof Image) ||
      ((img as PlatformImage).src !== undefined &&
        (img as PlatformImage).width !== undefined &&
        (img as PlatformImage).height !== undefined)
    );
  }

  /**
   * 判断是不是ImageBitmap实例
   * @param img 
   * @returns 
   */
  private isImageBitmap(img: any) {
    return (
      (Env.is(SE.H5) && img instanceof ImageBitmap) ||
      ((img as ImageBitmap).width !== undefined &&
        (img as ImageBitmap).height !== undefined &&
        typeof (img as ImageBitmap).close === 'function')
    )
  }

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
    const imageAwaits: Promise<PlatformImage | ImageBitmap>[] = [];
    const imageIns: PlatformImage[] = []
    const imageBitmapIns: ImageBitmap[] = []

    Object.keys(images).forEach((key: string) => {
      const image = images[key];

      if (this.isImage(image)) {
        imageIns.push(image as PlatformImage);
      } else {
        const p = loadImage(brush, image as RawImage, filename, key).then(
          (img) => {
            this.materials.set(key, img);

            if (this.isImage(img)) {
              imageIns.push(img as PlatformImage);
            } else if (this.isImageBitmap(img)) {
              imageBitmapIns.push(img as ImageBitmap);
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
  public createImage(canvas: PlatformCanvas): PlatformImage {
    const [img] = this.images.splice(0, 1);

    if (img) {
      return img;
    }

    if (Env.is(SE.H5)) {
      return new Image();
    }

    return (canvas as WechatMiniprogram.Canvas).createImage();
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
