import { LayoutNode } from "../core/LayoutNode";
import { NodeType } from "../types";

/**
 * Canvas渲染器
 * 将布局结果渲染到Canvas上
 */
export class CanvasRenderer {
  private readonly context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

  /**
   * 创建Canvas渲染器
   * @param canvas HTML Canvas元素或OffscreenCanvas
   * @param context Canvas上下文
   * @param devicePixelRatio 设备像素比
   */
  constructor(
    private readonly canvas: HTMLCanvasElement | OffscreenCanvas,
    private readonly devicePixelRatio: number = 1
  ) {
    this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
    // 设置Canvas尺寸，考虑设备像素比
    this.updateCanvasSize();
  }

  /**
   * 更新Canvas尺寸
   */
  private updateCanvasSize(): void {
    const { width, height } = this.canvas;

    // 设置Canvas的实际尺寸，考虑设备像素比
    if (this.canvas instanceof HTMLCanvasElement) {
      this.canvas.width = width * this.devicePixelRatio;
      this.canvas.height = height * this.devicePixelRatio;
      this.canvas.style.width = `${width}px`;
      this.canvas.style.height = `${height}px`;
    } else {
      this.canvas.width = width * this.devicePixelRatio;
      this.canvas.height = height * this.devicePixelRatio;
    }

    // 缩放上下文以匹配设备像素比
    this.context.scale(this.devicePixelRatio, this.devicePixelRatio);
  }

  /**
   * 清除Canvas
   */
  clear(): void {
    this.context.clearRect(
      0,
      0,
      this.canvas.width / this.devicePixelRatio,
      this.canvas.height / this.devicePixelRatio
    );
  }

  /**
   * 渲染布局树
   * @param rootNode 布局树的根节点
   */
  render(rootNode: LayoutNode): void {
    this.clear();
    this.renderNode(rootNode);
  }

  /**
   * 获取Canvas元素
   */
  getCanvas(): HTMLCanvasElement | OffscreenCanvas {
    return this.canvas;
  }

  /**
   * 获取Canvas上下文
   */
  getContext(): CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D {
    return this.context;
  }

  /**
   * 渲染单个节点及其子节点
   * @param node 要渲染的节点
   */
  private renderNode(node: LayoutNode): void {
    const { rect, style, type, children } = node;

    // 渲染背景
    if (style.backgroundColor) {
      this.context.fillStyle = style.backgroundColor;
      this.context.fillRect(rect.x, rect.y, rect.width, rect.height);
    }

    // 根据节点类型进行不同的渲染
    if (type === NodeType.TEXT) {
      this.renderText(node);
    } else if (type === NodeType.IMAGE) {
      this.renderImage(node);
    }

    // 递归渲染子节点
    for (const child of children) {
      this.renderNode(child);
    }
  }

  /**
   * 渲染文本节点
   * @param node 文本节点
   */
  private renderText(node: LayoutNode): void {
    const { rect, style } = node;
    const textMetrics = node.getTextMetrics();

    if (!textMetrics) {
      return;
    }

    const fontSize = style.fontSize || 16;
    const lineHeight = style.lineHeight || fontSize * 1.2;
    const color = style.color || "#000000";

    this.context.font = `${fontSize}px sans-serif`;
    this.context.fillStyle = color;
    this.context.textBaseline = "top";

    // 根据文本对齐方式设置textAlign
    if (style.textAlign) {
      this.context.textAlign = style.textAlign as CanvasTextAlign;
    } else {
      this.context.textAlign = "left";
    }

    // 渲染每一行文本
    const lines = textMetrics.lines;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const y = rect.y + i * lineHeight;

      // 根据textAlign确定x坐标
      let x = rect.x;
      if (this.context.textAlign === "center") {
        x = rect.x + rect.width / 2;
      } else if (this.context.textAlign === "right") {
        x = rect.x + rect.width;
      }

      this.context.fillText(line, x, y);
    }
  }

  /**
   * 渲染图像节点
   * @param node 图像节点
   */
  private renderImage(node: LayoutNode): void {
    const { rect, content } = node;

    if (!content) {
      return;
    }

    // 假设content是图像URL或数据URL
    const image = new Image();
    image.src = content;

    // 图像加载完成后渲染
    image.onload = () => {
      this.context.drawImage(image, rect.x, rect.y, rect.width, rect.height);
    };
  }
}
