import { platform } from "octopus-svga-engine";
import type { Bitmap, RawImage, PlatformImage } from "octopus-svga-engine";

/**
 * 动态元素管理器
 * 提供图片替换、文本添加、二维码生成等功能
 */
export class DynamicElementManager {
  /**
   * 动态素材映射
   */
  private readonly dynamicMaterials: Map<string, Bitmap> = new Map();

  constructor(private readonly painter: import("octopus-svga-engine").Painter) {}

  /**
   * 替换指定 key 的图片
   * @param key 动态元素的 key
   * @param source 图片源（URL 或 Uint8Array）
   * @returns Promise<Bitmap>
   */
  public async setImage(
    key: string,
    source: string | Uint8Array
  ): Promise<Bitmap> {
    const img = await platform.image.load(
      () => {
        const canvas = this.painter.F;
        if (!canvas) {
          throw new Error("Canvas not initialized");
        }
        return platform.image.create(canvas);
      },
      source,
      platform.path.resolve(key, "ext")
    );

    this.dynamicMaterials.set(key, img);
    return img;
  }

  /**
   * 添加动态文本
   * @param key 动态元素的 key
   * @param text 文本内容
   * @param options 文本选项
   * @returns Promise<Bitmap>
   */
  public async setText(
    key: string,
    text: string,
    options?: TextOptions
  ): Promise<Bitmap> {
    const {
      width = 200,
      height = 100,
      fontSize = 20,
      fontFamily = "Arial",
      color = "#000000",
      backgroundColor = "transparent",
      textAlign = "center",
      textBaseline = "middle",
    } = options || {};

    // 创建离屏画布
    const canvas = platform.getOfsCanvas({
      type: "2d",
      width,
      height,
    });

    const { context } = canvas;

    // 绘制背景
    if (backgroundColor !== "transparent") {
      context.fillStyle = backgroundColor;
      context.fillRect(0, 0, width, height);
    }

    // 绘制文本
    context.fillStyle = color;
    context.font = `${fontSize}px ${fontFamily}`;
    context.textAlign = textAlign;
    context.textBaseline = textBaseline;

    const x =
      textAlign === "left" ? 0 : textAlign === "right" ? width : width / 2;
    const y =
      textBaseline === "top"
        ? 0
        : textBaseline === "bottom"
        ? height
        : height / 2;

    context.fillText(text, x, y);

    // 转换为 ImageBitmap
    const bitmap = await (canvas.canvas as OffscreenCanvas).transferToImageBitmap();

    this.dynamicMaterials.set(key, bitmap);
    return bitmap;
  }

  /**
   * 添加二维码
   * @param key 动态元素的 key
   * @param content 二维码内容
   * @param options 二维码选项
   * @returns Promise<Bitmap>
   */
  public async setQRCode(
    key: string,
    content: string,
    options?: QRCodeOptions
  ): Promise<Bitmap> {
    const { size = 200, color = "#000000", backgroundColor = "#ffffff" } =
      options || {};

    // TODO: 实现二维码生成逻辑
    // 这里可以使用 qrcode 库或其他二维码生成库
    // 暂时返回一个占位符
    return await this.setText(key, "QR: " + content, {
      width: size,
      height: size,
      fontSize: 16,
      color,
      backgroundColor,
    });
  }

  /**
   * 添加自定义画布内容
   * @param key 动态元素的 key
   * @param context 画布上下文
   * @param options 画布选项
   * @returns Promise<Bitmap>
   */
  public async setCanvas(
    key: string,
    context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    options?: CanvasOptions
  ): Promise<Bitmap> {
    const { width = 200, height = 100, mode = "A" } = options || {};

    // 创建离屏画布
    const canvas = platform.getOfsCanvas({
      type: "2d",
      width,
      height,
    });

    const { context: targetContext } = canvas;

    // 复制画布内容
    if (mode === "A") {
      // 模式 A：直接复制
      targetContext.drawImage(context.canvas, 0, 0, width, height);
    } else {
      // 模式 B：其他处理
      // TODO: 实现其他模式的处理逻辑
    }

    // 转换为 ImageBitmap
    const bitmap = await (canvas.canvas as OffscreenCanvas).transferToImageBitmap();

    this.dynamicMaterials.set(key, bitmap);
    return bitmap;
  }

  /**
   * 获取动态素材
   * @param key 动态元素的 key
   * @returns Bitmap | undefined
   */
  public get(key: string): Bitmap | undefined {
    return this.dynamicMaterials.get(key);
  }

  /**
   * 获取所有动态素材
   * @returns Map<string, Bitmap>
   */
  public getAll(): Map<string, Bitmap> {
    return this.dynamicMaterials;
  }

  /**
   * 移除动态素材
   * @param key 动态元素的 key
   */
  public remove(key: string): void {
    const bitmap = this.dynamicMaterials.get(key);
    if (bitmap) {
      if (bitmap instanceof ImageBitmap) {
        bitmap.close();
      }
      this.dynamicMaterials.delete(key);
    }
  }

  /**
   * 清空所有动态素材
   */
  public clear(): void {
    for (const [key, bitmap] of this.dynamicMaterials) {
      if (bitmap instanceof ImageBitmap) {
        bitmap.close();
      }
    }
    this.dynamicMaterials.clear();
  }
}

/**
 * 文本选项
 */
export interface TextOptions {
  /**
   * 画布宽度
   */
  width?: number;
  /**
   * 画布高度
   */
  height?: number;
  /**
   * 字体大小
   */
  fontSize?: number;
  /**
   * 字体家族
   */
  fontFamily?: string;
  /**
   * 文本颜色
   */
  color?: string;
  /**
   * 背景颜色
   */
  backgroundColor?: string;
  /**
   * 文本对齐方式
   */
  textAlign?: CanvasTextAlign;
  /**
   * 文本基线
   */
  textBaseline?: CanvasTextBaseline;
}

/**
 * 二维码选项
 */
export interface QRCodeOptions {
  /**
   * 二维码尺寸
   */
  size?: number;
  /**
   * 二维码颜色
   */
  color?: string;
  /**
   * 背景颜色
   */
  backgroundColor?: string;
}

/**
 * 画布选项
 */
export interface CanvasOptions {
  /**
   * 画布宽度
   */
  width?: number;
  /**
   * 画布高度
   */
  height?: number;
  /**
   * 模式
   */
  mode?: "A" | "B";
}