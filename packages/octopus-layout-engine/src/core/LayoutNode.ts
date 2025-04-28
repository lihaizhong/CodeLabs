import { LayoutContext } from "./LayoutContext";
import {
  LayoutNodeOptions,
  NodeRect,
  NodeStyle,
  NodeType,
  TextMetrics,
} from "../types";

/**
 * 布局节点类
 * 表示布局树中的一个节点，可以是容器、文本或图像
 */
export class LayoutNode {
  /**
   * 节点类型
   */
  public readonly type: NodeType;
  /**
   * 节点内容
   */
  public readonly content: string;
  /**
   * 节点样式
   */
  public readonly style: NodeStyle;
  /**
   * 子节点
   */
  public readonly children: LayoutNode[];
  /**
   * 父节点
   */
  public readonly parent: LayoutNode | null;
  /**
   * 节点位置和尺寸
   */
  public readonly rect: NodeRect;
  /**
   * 文本测量结果
   */
  private textMetrics: TextMetrics | null = null;

  constructor(options: LayoutNodeOptions, parent: LayoutNode | null = null) {
    this.type = options.type;
    this.content = options.content || "";
    this.style = options.style || {};
    this.parent = parent;
    this.rect = { x: 0, y: 0, width: 0, height: 0 };
    this.children = (options.children || []).map(
      (childOptions) => new LayoutNode(childOptions, this)
    );;
  }

  /**
   * 获取节点的绝对位置
   */
  setPosition(x: number, y: number): void {
    this.rect.x = x;
    this.rect.y = y;
  }

  /**
   * 获取文本测量结果
   */
  getTextMetrics(): TextMetrics | null {
    return this.textMetrics;
  }

  /**
   * 设置文本测量结果
   */
  setTextMetrics(metrics: TextMetrics): void {
    this.textMetrics = metrics;
  }

  /**
   * 测量节点尺寸
   * @param context 布局上下文
   */
  measure(context: LayoutContext): void {
    const { style, type } = this;
    const { width, height } = style;
    const maxWidth = width;

    // 根据节点类型进行不同的测量
    const fontSize = style.fontSize || 16;
    const fontFamily = style.fontFamily || "sans-serif";
    const lineHeight = style.lineHeight || fontSize * 1.2;

    if (type === "text") {
      // 测量文本
      this.textMetrics = context.measureText(
        this.content,
        fontSize,
        fontFamily,
        maxWidth,
        lineHeight
      );

      // 设置节点尺寸
      this.rect.width = width || this.textMetrics.width;
      this.rect.height = height || this.textMetrics.height;
    } else {
      this.rect.width = width || 0;
      this.rect.height = height || 0;
    }

    // 递归测量子节点
    for (const child of this.children) {
      child.measure(context);
    }
  }
}
