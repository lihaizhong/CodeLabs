import { platform } from "../platform";
import { generateImageBufferFromCode, IQrCodeImgOptions } from "./qrcode";
import { getBufferFromImageData } from "./png";
import { ResourceManager } from "src/extensions";

interface VideoEditorOptions {
  // 模式: R 替换, A 追加
  mode?: "R" | "A";
  container?: string;
  component?: any;
}

export class VideoEditor {
  constructor(
    private readonly resource: ResourceManager,
    private readonly entity: PlatformVideo.Video,
    private readonly options: Omit<VideoEditorOptions, "mode"> = {}
  ) {}

  private async set(
    key: string,
    value: OctopusPlatform.RawImage,
    mode: VideoEditorOptions["mode"] = "R"
  ) {
    if (mode === "A") {
      await this.resource.loadImages(
        { [key]: value },
        this.entity.filename,
        "dynamic"
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
  async createContext(width: number, height: number) {
    if (platform.globals.env !== "h5" || "OffscreenCanvas" in globalThis) {
      return platform.getOfsCanvas({ width, height });
    }

    const { container, component } = this.options;
    if (container) {
      const result = await platform.getCanvas(container, component);
      if (result.context) {
        result.canvas.width = width;
        result.canvas.height = height;
      }

      return result;
    }

    throw new Error(
      "Don't support OffscreenCanvas, and please provide a container"
    );
  }

  /**
   * 创建画布图片
   * @param context
   * @param options
   * @returns
   */
  async setCanvas(
    key: string,
    context: PlatformRenderingContext2D,
    options?: VideoEditorOptions & { width?: number, height?: number }
  ) {
    if (this.entity.locked) return;

    const { canvas } = context;
    const width = options?.width ?? canvas.width;
    const height = options?.height ?? canvas.height;
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
