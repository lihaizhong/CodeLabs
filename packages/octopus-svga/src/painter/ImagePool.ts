// import benchmark from "../benchmark";
import { platform } from "../platform";

export class ImagePool {
  /**
   * 待复用的 img 标签
   */
  // FIXME: 微信小程序创建调用太多createImage会导致微信/微信小程序崩溃
  private images: OctopusPlatform.PlatformImage[] = [];

  /**
   * 动态素材
   */
  public dynamicMaterials: Map<string, OctopusPlatform.Bitmap> = new Map();

  /**
   * 素材
   */
  public materials: Map<string, OctopusPlatform.Bitmap> = new Map();

  /**
   * 创建图片标签
   * @returns
   */
  public getReleaseImage(): OctopusPlatform.PlatformImage | undefined {
    return this.images.shift();
  }

  /**
   * 加载图片集
   * @param images 图片数据
   * @param filename 文件名称
   * @returns
   */
  public loadAll(
    images: RawImages | PlatformImages,
    filename: string
  ): Promise<void[]> {
    const { load, isImage } = platform.image;
    const imageAwaits: Promise<void>[] = [];

    Object.keys(images).forEach((key: string) => {
      const image = images[key];

      if (isImage(image)) {
        this.materials.set(key, image as OctopusPlatform.PlatformImage);
      } else {
        const p = load(image as OctopusPlatform.RawImage, filename, key).then(
          (img) => {
            this.materials.set(key, img);
          }
        );

        imageAwaits.push(p);
      }
    });

    return Promise.all<void>(imageAwaits);

    // return benchmark.time<void[]>("loadAll", () => {
    //   const { load, isImage } = platform.image;
    //   const imageAwaits: Promise<void>[] = [];

    //   Object.keys(images).forEach((key: string) => {
    //     const image = images[key];

    //     if (isImage(image)) {
    //       this.materials.set(key, image as OctopusPlatform.PlatformImage);
    //     } else {
    //       const p = load(image as OctopusPlatform.RawImage, filename, key).then((img) => {
    //         this.materials.set(key, img)
    //       });

    //       imageAwaits.push(p);
    //     }
    //   });

    //   return Promise.all<void>(imageAwaits);
    // });
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
    const { env } = platform.globals;
    const { isImage, isImageBitmap } = platform.image;

    // FIXME: 支付宝小程序 image 修改 src 无法触发 onload 事件
    if (env !== "alipay") {
      const releaseOne = (image: OctopusPlatform.Bitmap) => {
        if (isImage(image)) {
          (image as OctopusPlatform.PlatformImage).onload = null;
          (image as OctopusPlatform.PlatformImage).onerror = null;
          (image as OctopusPlatform.PlatformImage).src = "";

          this.images.push(image as OctopusPlatform.PlatformImage);
        } else if (isImageBitmap(image)) {
          (image as ImageBitmap).close();
        }
      };

      this.materials.forEach(releaseOne);
      this.dynamicMaterials.forEach(releaseOne);
    }

    this.materials.clear();
    this.dynamicMaterials.clear();
    this.images = Array.from(new Set(this.images));
  }
}
