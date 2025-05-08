import { LayoutNode } from "./LayoutNode";

/**
 * Canvas渲染器
 * 将布局结果渲染到Canvas上
 */
export class LayoutRenderer {
  private readonly width: number;
  private readonly height: number;
  /**
   * 创建Canvas渲染器
   * @param canvas HTML Canvas元素或OffscreenCanvas
   * @param context Canvas上下文
   * @param devicePixelRatio 设备像素比
   */
  constructor(
    private readonly context:
      | CanvasRenderingContext2D
      | OffscreenCanvasRenderingContext2D,
    private readonly devicePixelRatio: number = 1
  ) {
    const { canvas } = this.context;
    const { width, height } = canvas;

    // 设置Canvas的实际尺寸，考虑设备像素比
    canvas.width = width * this.devicePixelRatio;
    canvas.height = height * this.devicePixelRatio;

    this.width = width;
    this.height = height;
    // 缩放上下文以匹配设备像素比
    this.context.scale(this.devicePixelRatio, this.devicePixelRatio);
  }

  /**
   * 清除Canvas
   */
  clear(): void {
    this.context.clearRect(0, 0, this.width, this.height);
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
    return this.context.canvas;
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
    if (type === OctopusLayout.NodeType.TEXT) {
      this.renderText(node);
    } else if (type === OctopusLayout.NodeType.IMAGE) {
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
    const { lines } = textMetrics;
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

    // 图像加载完成后渲染
    image.onload = () => {
      const { width, height, x, y } = rect;

      this.context.drawImage(image, x, y, width, height);
    };
    image.src = content;
  }
}
