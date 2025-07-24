import type { RawImage, PlatformImage, Bitmap } from "octopus-platform";
import { Painter } from "../../core/painter";
import { platform } from "../../platform";
import type { RawImages } from "../../types";

export class ResourceManager {
  /**
   * 判断是否是 ImageBitmap
   * @param img
   * @returns
   */
  private static isBitmap(img: any): boolean {
    return platform.globals.env === "h5" && img instanceof ImageBitmap;
  }

  /**
   * 释放内存资源（图片）
   * @param img
   */
  private static releaseOne(img: PlatformImage | ImageBitmap) {
    if (ResourceManager.isBitmap(img)) {
      (img as ImageBitmap).close();
    } else if ((img as PlatformImage).src !== "") {
      // 【微信】将存在本地的文件删除，防止用户空间被占满
      if (
        platform.globals.env === "weapp" &&
        (img as PlatformImage).src.includes(
          platform.path.USER_DATA_PATH
        )
      ) {
        platform.local!.remove((img as PlatformImage).src);
      }

      platform.image.release(img as PlatformImage);
    }
  }

  // FIXME: 微信小程序创建调用太多createImage会导致微信/微信小程序崩溃
  private caches: Array<PlatformImage | ImageBitmap> = [];

  /**
   * 动态素材
   */
  public readonly dynamicMaterials: Map<string, Bitmap> =
    new Map();

  /**
   * 素材
   */
  public readonly materials: Map<string, Bitmap> = new Map();

  /**
   * 已清理Image对象的坐标
   */
  private point: number = 0;

  constructor(private readonly painter: Painter) {}

  /**
   * 创建图片标签
   * @returns
   */
  private createImage(): PlatformImage {
    let img: PlatformImage | null = null;

    if (this.point > 0) {
      this.point--;
      img = this.caches.shift() as PlatformImage;
    }

    if (!img) {
      img = platform.image.create(this.painter.F!);
    }

    this.caches.push(img);

    return img;
  }

  /**
   * 将 ImageBitmap 插入到 caches
   * @param img
   */
  private inertBitmapIntoCaches(
    img: PlatformImage | ImageBitmap
  ) {
    if (ResourceManager.isBitmap(img)) {
      this.caches.push(img);
    }
  }

  /**
   * 加载额外的图片资源
   * @param source 资源内容/地址
   * @param filename 文件名称
   * @returns
   */
  public loadExtImage(
    source: string | Uint8Array,
    filename: string
  ): Promise<PlatformImage | ImageBitmap> {
    return platform.image
      .load(
        () => this.createImage(),
        source,
        platform.path.resolve(filename, "ext")
      )
      .then((img) => {
        this.inertBitmapIntoCaches(img);

        return img;
      });
  }

  /**
   * 加载图片集
   * @param images 图片数据
   * @param filename 文件名称
   * @returns
   */
  public async loadImagesWithRecord(
    images: RawImages,
    filename: string,
    type: "normal" | "dynamic" = "normal"
  ): Promise<void> {
    const imageAwaits: Promise<void>[] = [];
    const imageFilename = `${filename.replace(/\.svga$/g, "")}.png`;

    Object.entries(images).forEach(([name, image]) => {
      // 过滤 1px 透明图
      if (image instanceof Uint8Array && image.byteLength < 70) {
        return;
      }

      const p = platform.image
        .load(
          () => this.createImage(),
          image as RawImage,
          platform.path.resolve(
            imageFilename,
            type === "dynamic" ? `dyn_${name}` : name
          )
        )
        .then((img) => {
          this.inertBitmapIntoCaches(img);
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

  /**
   * 释放图片资源
   */
  public release(): void {
    // FIXME: 小程序 image 对象需要手动释放内存，否则可能导致小程序崩溃
    for (const img of this.caches) {
      ResourceManager.releaseOne(img);
    }

    this.materials.clear();
    this.dynamicMaterials.clear();
    // FIXME: 支付宝小程序 image 修改 src 无法触发 onload 事件
    platform.globals.env === "alipay" ? this.cleanup() : this.tidyUp();
  }

  /**
   * 整理图片资源，将重复的图片资源移除
   */
  private tidyUp() {
    // 通过 Set 的去重特性，保持 caches 元素的唯一性
    this.caches = Array.from(new Set(this.caches));
    this.point = this.caches.length;
  }

  /**
   * 清理图片资源
   */
  public cleanup(): void {
    this.caches.length = 0;
    this.point = 0;
  }
}
