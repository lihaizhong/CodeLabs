import { LayoutContext } from './LayoutContext';
import { LayoutNodeOptions, NodeRect, NodeStyle, NodeType, TextMetrics } from '../types';

/**
 * 布局节点类
 * 表示布局树中的一个节点，可以是容器、文本或图像
 */
export class LayoutNode {
  private id: string;
  private type: NodeType;
  private content: string;
  private style: NodeStyle;
  private children: LayoutNode[];
  private parent: LayoutNode | null;
  private rect: NodeRect;
  private textMetrics: TextMetrics | null;

  constructor(options: LayoutNodeOptions) {
    this.id = options.id || Math.random().toString(36).substring(2, 9);
    this.type = options.type;
    this.content = options.content || '';
    this.style = options.style || {};
    this.children = [];
    this.parent = null;
    this.rect = { x: 0, y: 0, width: 0, height: 0 };
    this.textMetrics = null;

    // 创建子节点
    if (options.children && options.children.length > 0) {
      this.children = options.children.map(childOptions => {
        const child = new LayoutNode(childOptions);
        child.setParent(this);
        return child;
      });
    }
  }

  /**
   * 获取节点ID
   */
  getId(): string {
    return this.id;
  }

  /**
   * 获取节点类型
   */
  getType(): NodeType {
    return this.type;
  }

  /**
   * 获取节点内容
   */
  getContent(): string {
    return this.content;
  }

  /**
   * 获取节点样式
   */
  getStyle(): NodeStyle {
    return this.style;
  }

  /**
   * 获取子节点列表
   */
  getChildren(): LayoutNode[] {
    return this.children;
  }

  /**
   * 获取父节点
   */
  getParent(): LayoutNode | null {
    return this.parent;
  }

  /**
   * 设置父节点
   */
  setParent(parent: LayoutNode | null): void {
    this.parent = parent;
  }

  /**
   * 添加子节点
   */
  appendChild(child: LayoutNode): void {
    this.children.push(child);
    child.setParent(this);
  }

  /**
   * 获取节点位置和尺寸
   */
  getRect(): NodeRect {
    return this.rect;
  }

  /**
   * 设置节点位置和尺寸
   */
  setRect(rect: NodeRect): void {
    this.rect = rect;
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
    // 根据节点类型进行不同的测量
    if (this.type === NodeType.TEXT && this.content) {
      const fontSize = this.style.fontSize || 16;
      const fontFamily = this.style.fontFamily || 'sans-serif';
      const lineHeight = this.style.lineHeight || fontSize * 1.2;
      const maxWidth = this.style.width || context.width;
      
      // 测量文本
      this.textMetrics = context.measureText(
        this.content,
        fontSize,
        fontFamily,
        maxWidth,
        lineHeight
      );

      // 设置节点尺寸
      this.rect.width = this.style.width || this.textMetrics.width;
      this.rect.height = this.style.height || this.textMetrics.height;
    } else if (this.type === NodeType.IMAGE) {
      // 图像节点尺寸
      this.rect.width = this.style.width || 0;
      this.rect.height = this.style.height || 0;
    } else {
      // 容器节点尺寸
      this.rect.width = this.style.width || 0;
      this.rect.height = this.style.height || 0;
    }

    // 递归测量子节点
    for (const child of this.children) {
      child.measure(context);
    }
  }
}