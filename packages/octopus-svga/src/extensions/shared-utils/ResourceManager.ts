import { Painter } from "../../painter";
import { platform } from "../../platform";

export class ResourceManager {
  // FIXME: 微信小程序创建调用太多createImage会导致微信/微信小程序崩溃
  private caches: Array<OctopusPlatform.PlatformImage | ImageBitmap> = [];

  /**
   * 动态素材
   */
  public readonly dynamicMaterials: Map<string, OctopusPlatform.Bitmap> =
    new Map();

  /**
   * 素材
   */
  public readonly materials: Map<string, OctopusPlatform.Bitmap> = new Map();

  /**
   * 已清理Image对象的坐标
   */
  private point: number = 0;

  constructor(private readonly painter: Painter) {}

  private createImage(): OctopusPlatform.PlatformImage {
    let img: OctopusPlatform.PlatformImage | null = null;

    if (this.point > 0) {
      this.point--;

      img = this.caches.shift() as OctopusPlatform.PlatformImage;
    }

    if (!img) {
      img =
        platform.globals.env === "h5"
          ? new Image()
          : (
              this.painter.X as
                | OctopusPlatform.MiniProgramCanvas
                | OctopusPlatform.MiniProgramOffscreenCanvas
            ).createImage();
    }

    this.caches.push(img);

    return img;
  }

  /**
   * 加载图片集
   * @param images 图片数据
   * @param filename 文件名称
   * @returns
   */
  async loadImages(
    images: RawImages,
    filename: string,
    prefix: string = "",
    type: "normal" | "dynamic" = "normal"
  ): Promise<void> {
    const { env } = platform.globals;
    const imageAwaits: Promise<void>[] =
      [];

    Object.entries(images).forEach(([name, image]) => {
      const p = platform.image.load(
        () => this.createImage(),
        image as OctopusPlatform.RawImage,
        platform.path.resolve(filename, prefix ? `${prefix}_${name}` : name)
      ).then((img) => {
        if (env === "h5" && img instanceof ImageBitmap) {
          this.caches.push(img);
        }

        if (type === "dynamic") {
          this.dynamicMaterials.set(name, img);
        } else {
          this.materials.set(name, img);
        }
      });

      imageAwaits.push(p);
    });

    await Promise.all(imageAwaits);
  }

  release(): void {
    const { env } = platform.globals;

    // FIXME: 小程序 image 对象需要手动释放内存，否则可能导致小程序崩溃
    for (const img of this.caches) {
      if (env === "h5" && img instanceof ImageBitmap) {
        img.close();
      } else if (
        typeof img === "object" &&
        img !== null &&
        (img as OctopusPlatform.PlatformImage).src !== ""
      ) {
        (img as OctopusPlatform.PlatformImage).src = "";
        (img as OctopusPlatform.PlatformImage).onload = null;
        (img as OctopusPlatform.PlatformImage).onerror = null;
      }
    }

    // FIXME: 支付宝小程序 image 修改 src 无法触发 onload 事件
    if (env === "alipay" || env === "h5") {
      this.cleanup();
    } else {
      this.caches = Array.from(new Set(this.caches));
      this.point = this.caches.length;
    }
  }

  cleanup(): void {
    this.caches.length = 0;
    this.point = 0;
  }
}
