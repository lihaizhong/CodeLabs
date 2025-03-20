import { Env, SE } from "../env";
import { loadImage } from "../polyfill";
import { Brush } from "./brush";

export class ImageManager {
  // FIXME: 微信小程序创建调用太多createImage会导致微信/微信小程序崩溃
  private pool: PlatformImage[] = [];

  /**
   * 素材
   */
  private materials: Map<string, Bitmap> = new Map();

  /**
   * 判断是不是图片
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
   * 获取图片素材
   * @returns
   */
  public getMaterials() {
    return this.materials;
  }

  /**
   * 清理素材
   */
  public clear() {
    this.materials.clear();

    for (let i = 0; i < this.pool.length; i++) {
      const img = this.pool[i];

      img.onload = null;
      img.onerror = null;
      img.src = "";
    }
  }

  /**
   * 加载图片集
   * @param images 图片数据
   * @param filename 文件名称
   * @returns
   */
  public async loadImage(
    images: RawImages | PlatformImages,
    brush: Brush,
    filename: string
  ): Promise<void> {
    const imageArr: Promise<PlatformImage | ImageBitmap>[] = [];

    Object.keys(images).forEach((key: string) => {
      const image = images[key];

      if (this.isImage(image)) {
        imageArr.push(Promise.resolve(image as PlatformImage | ImageBitmap));
      } else {
        const p = loadImage(brush, image as RawImage, filename, key).then(
          (img) => {
            this.materials.set(key, img);

            return img;
          }
        );

        imageArr.push(p);
      }
    });

    const imgs = await Promise.all<PlatformImage | ImageBitmap>(imageArr);
    this.pool = imgs.filter((img) => this.isImage(img)) as PlatformImage[];
  }

  /**
   * 创建图片标签
   * @returns
   */
  public createImage(canvas: PlatformCanvas): PlatformImage {
    const [img] = this.pool.splice(0, 1);

    if (img) {
      return img;
    }

    if (Env.is(SE.H5)) {
      return new Image();
    }

    return (canvas as WechatMiniprogram.Canvas).createImage();
  }
}
