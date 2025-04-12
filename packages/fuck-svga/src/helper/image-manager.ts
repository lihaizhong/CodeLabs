import { platform } from "../platform";
import { Brush } from "../player/brush";

export class ImageManager {
  /**
   * 待复用的 img 标签
   */
  // FIXME: 微信小程序创建调用太多createImage会导致微信/微信小程序崩溃
  private images: PlatformImage[] = [];

  /**
   * 动态素材
   */
  private dynamicMaterials: Map<string, Bitmap> = new Map();

  /**
   * 素材
   */
  private materials: Map<string, Bitmap> = new Map();

  /**
   * 释放图片标签
   * @param image
   */
  private appendCleanedImage(image: Bitmap | PlatformCanvas) {
    const { isImage, isImageBitmap } = platform.image;

    if (isImage(image)) {
      (image as unknown as PlatformImage).onload = null;
      (image as unknown as PlatformImage).onerror = null;
      (image as unknown as PlatformImage).src = "";

      this.images.push(image as PlatformImage);
    } else if (isImageBitmap(image)) {
      (image as unknown as ImageBitmap).close();
    }
  }

  /**
   * 获取图片素材
   * @returns
   */
  public getMaterials() {
    return this.materials;
  }

  /**
   * 获取动态图片素材
   * @returns 
   */
  public getDynamicMaterials() {
    return this.dynamicMaterials;
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
    const { load, isImage } = platform.image;
    const imageAwaits: Promise<any>[] = [];

    Object.keys(images).forEach((key: string) => {
      const image = images[key];

      if (isImage(image)) {
        this.materials.set(key, image as unknown as PlatformImage);
      } else {
        const p = load(brush, image as RawImage, filename, key).then((img) =>
          this.materials.set(key, img)
        );

        imageAwaits.push(p);
      }
    });

    await Promise.all<PlatformImage | ImageBitmap>(imageAwaits);
  }

  /**
   * 创建图片标签
   * @returns
   */
  public createImage(
    canvas: FuckSvga.PlatformCreateImageInstance
  ): PlatformImage {
    return this.images.shift() || platform.image.create(canvas);
  }

  /**
   * 更新动态素材
   * @param images 
   */
  public updateDynamicMaterials(images: PlatformImages) {
    this.dynamicMaterials = new Map(Object.entries(images))
  }

  /**
   * 清理重复的图片标签
   */
  public tidyUp() {
    this.images = Array.from(new Set(this.images));
  }

  /**
   * 清理素材
   */
  public clear() {
    const { env } = platform.global;

    // FIXME: 支付宝小程序 image 修改 src 无法触发 onload 事件
    if (env !== "alipay") {
      this.materials.forEach((value) => {
        this.appendCleanedImage(value);
      });

      this.dynamicMaterials.forEach((value) => {
        this.appendCleanedImage(value);
      })
    }

    this.materials.clear();
    this.tidyUp();
  }
}
