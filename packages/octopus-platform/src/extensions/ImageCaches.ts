export class ImageCaches implements OctopusPlatform.ImageCaches {
  // FIXME: 微信小程序创建调用太多createImage会导致微信/微信小程序崩溃
  private caches: Array<OctopusPlatform.PlatformImage | ImageBitmap> = [];
  // 已清理Image对象的坐标
  private point: number = 0;

  getImage() {
    let img: OctopusPlatform.PlatformImage | null = null;

    if (this.point > 0) {
      this.point--;

      img = this.caches.shift() as OctopusPlatform.PlatformImage;
    }

    return img;
  }

  getCaches() {
    return this.caches;
  }

  push(img: OctopusPlatform.PlatformImage | ImageBitmap) {
    this.caches.push(img);
  }

  tidy() {
    this.caches = Array.from(new Set(this.caches));
    this.point = this.caches.length;
  }

  cleanup() {
    this.caches.length = 0;
    this.point = 0;
  }
}
