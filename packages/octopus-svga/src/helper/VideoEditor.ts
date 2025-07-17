import type { RawImage, PlatformImage } from "octopus-platform";
import { platform } from "../core/platform";
import { Parser } from "../core/parser";
import { generateImageBufferFromCode, IQrCodeImgOptions } from "./qrcode";
import { getBufferFromImageData } from "./png";
import type { ResourceManager } from "../extensions";
import type { Painter } from "../core/painter";
import type { PlatformVideo, PlatformRenderingContext2D } from "../types";

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
    value: RawImage,
    mode: VideoEditorOptions["mode"] = "R"
  ) {
    const { entity, resource } = this;

    if (mode === "A") {
      await resource.loadImagesWithRecord(
        { [key]: value },
        entity.filename,
        "dynamic"
      );
    } else {
      entity.images[key] = value;
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
   * 是否是有效的Key
   * @param key
   * @returns
   */
  hasValidKey(key: string): boolean {
    const { images } = this.entity;

    if (typeof Object.hasOwn === "function") {
      return Object.hasOwn(images, key);
    }

    return Object.prototype.hasOwnProperty.call(images, key);
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
  ): Promise<PlatformImage | ImageBitmap> {
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

    await this.set(
      key,
      new Uint8Array(getBufferFromImageData(imageData)),
      options?.mode
    );
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
      await this.set(
        key,
        new Uint8Array(await Parser.download(url)),
        options?.mode
      );
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

    await this.set(
      key,
      new Uint8Array(generateImageBufferFromCode({ ...options, code })),
      options?.mode
    );
  }
}
