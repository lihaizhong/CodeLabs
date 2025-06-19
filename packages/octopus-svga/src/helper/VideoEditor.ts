import { platform } from "../platform";
import { generateImageBufferFromCode, IQrCodeImgOptions } from "./qrcode";
import { getBufferFromImageData } from "./png";
import type { ResourceManager } from "src/extensions";
import type { Painter } from "src/painter";

interface VideoEditorOptions {
  // 模式: R 替换, A 追加
  mode?: "R" | "A";
}

export class VideoEditor {
  constructor(
    private readonly painter: Painter,
    private readonly resource: ResourceManager,
    private readonly entity: PlatformVideo.Video
  ) {}

  private async set(
    key: string,
    value: OctopusPlatform.RawImage,
    mode: VideoEditorOptions["mode"] = "R"
  ) {
    const { images, filename } = this.entity;

    if (!(key in images)) {
      return;
    }

    if (mode === "A") {
      await this.resource.loadImages({ [key]: value }, filename, "dynamic");
    } else {
      images[key] = value;
    }
  }

  /**
   * 获取自定义编辑器
   * @returns
   */
  getContext() {
    return this.painter.YC;
  }

  /**
   * 加载并缓存图片
   * @param source
   * @param url
   * @returns
   */
  loadImage(
    source: Uint8Array | string,
    url: string
  ): Promise<OctopusPlatform.PlatformImage | ImageBitmap> {
    return this.resource.loadExtImage(source, platform.path.filename(url));
  }

  /**
   * 创建画布图片
   * @param key
   * @param context
   * @param options
   * @returns
   */
  async setCanvas(
    key: string,
    context: PlatformRenderingContext2D,
    options?: VideoEditorOptions & { width?: number; height?: number }
  ) {
    if (this.entity.locked) return;

    const { canvas } = context;
    const width = options?.width ?? canvas.width;
    const height = options?.height ?? canvas.height;
    const imageData = context.getImageData(0, 0, width, height);
    const buff = getBufferFromImageData(imageData);

    context.reset();
    await this.set(key, new Uint8Array(buff), options?.mode);
  }

  /**
   * 创建二进制图片
   * @param key
   * @param buff
   * @param options
   * @returns
   */
  async setImage(key: string, url: string, options?: VideoEditorOptions) {
    if (this.entity.locked) return;

    if (url.startsWith("data:image")) {
      await this.set(key, url, options?.mode);
    } else {
      const buff = await platform.remote.fetch(url);

      await this.set(key, new Uint8Array(buff), options?.mode);
    }
  }

  /**
   * 创建二维码图片
   * @param key
   * @param code
   * @param options
   * @returns
   */
  async setQRCode(
    key: string,
    code: string,
    options: VideoEditorOptions & Omit<IQrCodeImgOptions, "code">
  ) {
    if (this.entity.locked) return;

    const buff = generateImageBufferFromCode({ ...options, code });

    await this.set(key, new Uint8Array(buff), options?.mode);
  }
}
