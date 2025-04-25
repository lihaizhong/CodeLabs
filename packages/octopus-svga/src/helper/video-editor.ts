import { platform } from "../platform";
import {
  generateImageBufferFromCode,
  IQrCodeImgOptions,
} from "./qrcode-helper";
import { getBufferFromImageData } from "./png-helper";
import type { Painter } from "../painter";

interface VideoEditorOptions {
  // 模式: R 替换, A 追加
  mode: "R" | "A";
}

export class VideoEditor {
  constructor(
    private readonly entity: Video,
    private readonly painter: Painter
  ) {}

  private async set(
    key: string,
    value: Uint8Array,
    mode: VideoEditorOptions["mode"] = "R"
  ) {
    if (mode === "A") {
      this.entity.dynamicElements[key] = await platform.image.load(
        this.painter,
        value,
        this.entity.filename,
        `dynamic.${key}`
      );
    } else {
      this.entity.images[key] = value;
    }
  }

  /**
   * 创建自定义编辑器
   * @param width
   * @param height
   * @returns
   */
  createEditor(width: number, height: number) {
    return platform.getOfsCanvas({ width, height });
  }

  createTextEditor(
    key: string,
    width: number,
    height: number,
    options?: VideoEditorOptions
  ) {}

  /**
   * 创建画布图片
   * @param context
   * @param options
   * @returns
   */
  async setCanvas(
    key: string,
    context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
    options?: VideoEditorOptions
  ) {
    if (this.entity.locked) return;

    const { width, height } = context.canvas;
    const imageData = context.getImageData(0, 0, width, height);
    const buff = getBufferFromImageData(imageData);

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

    const buff = await platform.remote.fetch(url);

    await this.set(key, new Uint8Array(buff), options?.mode);
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
