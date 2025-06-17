import { Painter } from "../../painter";
import { platform } from "../../platform";

export class ResourceManager {
  private static isBitmap(img: any): boolean {
    return platform.globals.env === "h5" && img instanceof ImageBitmap;
  }

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
      img = platform.image.create(this.painter.X!);
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
  public async loadImages(
    images: RawImages,
    filename: string,
    type: "normal" | "dynamic" = "normal"
  ): Promise<void> {
    const imageAwaits: Promise<void>[] = [];

    Object.entries(images).forEach(([name, image]) => {
      const p = platform.image
        .load(
          () => this.createImage(),
          image as OctopusPlatform.RawImage,
          platform.path.resolve(
            filename,
            type === "dynamic" ? `dynamic_${name}` : name
          )
        )
        .then((img) => {
          if (ResourceManager.isBitmap(img)) {
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

  public release(): void {
    const { env } = platform.globals;

    // FIXME: 小程序 image 对象需要手动释放内存，否则可能导致小程序崩溃
    for (const img of this.caches) {
      if (ResourceManager.isBitmap(img)) {
        (img as ImageBitmap).close();
      } else if ((img as OctopusPlatform.PlatformImage).src !== "") {
        // 【微信】将存在本地的文件删除，防止用户空间被占满
        if (
          env === "weapp" &&
          (img as OctopusPlatform.PlatformImage).src.includes(
            platform.path.USER_DATA_PATH
          )
        ) {
          platform.local!.remove((img as OctopusPlatform.PlatformImage).src);
        }

        platform.image.release(img as OctopusPlatform.PlatformImage);
      }
    }

    this.materials.clear();
    this.dynamicMaterials.clear();
    // FIXME: 支付宝小程序 image 修改 src 无法触发 onload 事件
    env === "alipay" || env === "h5" ? this.cleanup() : this.tidyUp();
  }

  private tidyUp() {
    // 通过 Set 的去重特性，保持 caches 元素的唯一性
    this.caches = Array.from(new Set(this.caches));
    this.point = this.caches.length;
  }

  public cleanup(): void {
    this.caches.length = 0;
    this.point = 0;
  }
}
