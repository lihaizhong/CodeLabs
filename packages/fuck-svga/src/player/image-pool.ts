import benchmark from "../benchmark";
import { platform } from "../platform";
import { Brush } from "./brush";

export class ImagePool {
  /**
   * 待复用的 img 标签
   */
  // FIXME: 微信小程序创建调用太多createImage会导致微信/微信小程序崩溃
  private images: PlatformImage[] = [];

  /**
   * 动态素材
   */
  public dynamicMaterials: Map<string, Bitmap> = new Map();

  /**
   * 素材
   */
  public materials: Map<string, Bitmap> = new Map();

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
   * 加载图片集
   * @param images 图片数据
   * @param filename 文件名称
   * @returns
   */
  public loadAll(
    images: RawImages | PlatformImages,
    brush: Brush,
    filename: string
  ): Promise<void[]> {
    return benchmark.time<void[]>("loadAll", () => {
      const { load, isImage } = platform.image;
      const imageAwaits: Promise<void>[] = [];

      Object.keys(images).forEach((key: string) => {
        const image = images[key];
  
        if (isImage(image)) {
          this.materials.set(key, image as unknown as PlatformImage);
        } else {
          const p = load(brush, image as RawImage, filename, key).then((img) => {
            this.materials.set(key, img)
          });
  
          imageAwaits.push(p);
        }
      });
  
      return Promise.all<void>(imageAwaits);
    });
  }

  /**
   * 更新动态素材
   * @param images 
   */
  public appendAll(images: PlatformImages) {
    this.dynamicMaterials = new Map(Object.entries(images));
  }

  /**
   * 清理素材
   */
  public release() {
    const { env } = platform.global;
    const { isImage, isImageBitmap } = platform.image;

    // FIXME: 支付宝小程序 image 修改 src 无法触发 onload 事件
    if (env !== "alipay") {
      const release = (image: Bitmap | PlatformCanvas) => {
        if (isImage(image)) {
          (image as unknown as PlatformImage).onload = null;
          (image as unknown as PlatformImage).onerror = null;
          (image as unknown as PlatformImage).src = "";

          this.images.push(image as PlatformImage);
        } else if (isImageBitmap(image)) {
          (image as unknown as ImageBitmap).close();
        }
      }

      this.materials.forEach(release);
      this.dynamicMaterials.forEach(release);
    }

    this.materials.clear();
    this.dynamicMaterials.clear();
    this.images = Array.from(new Set(this.images));
  }
}
