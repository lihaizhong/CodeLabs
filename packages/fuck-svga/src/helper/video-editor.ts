import { platform } from "../platform";
import {
  generateImageBufferFromCode,
  IQrCodeImgOptions,
} from "../helper/qrcode-helper";
import { getBufferFromImageData } from "./png-helper";
import type { Brush } from "../player/brush";

interface VideoEditorOptions {
  mode: "replace" | "append";
}

export class VideoEditor {
  constructor(private readonly entity: Video, private readonly brush: Brush) {}

  private async set(
    key: string,
    value: Uint8Array,
    mode: "replace" | "append" = "replace"
  ) {
    if (mode === "append") {
      this.entity.dynamicElements[key] = await platform.image.load(
        this.brush,
        value,
        this.entity.filename,
        key
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

  /**
   * 创建画布图片
   * @param context
   * @param options
   * @returns
   */
  async setCanvas(
    key: string,
    context: CanvasRenderingContext2D,
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
   */
  async setImage(key: string, url: string, options?: VideoEditorOptions) {
    if (this.entity.locked) return;

    const buff = await platform.remote.fetch(url);

    await this.set(key, new Uint8Array(buff), options?.mode);
  }

  /**
   * 创建二维码图片
   */
  async setQRCode(
    code: string,
    options: VideoEditorOptions & Omit<IQrCodeImgOptions, "code">
  ) {
    if (this.entity.locked) return;

    const buff = generateImageBufferFromCode({ ...options, code });

    await this.set(code, new Uint8Array(buff), options?.mode);
  }
}
