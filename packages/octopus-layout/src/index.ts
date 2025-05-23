/**
 * Octopus Layout - Canvas 2D 布局引擎
 * 基于 CSS 属性的文字布局系统
 */

export class CanvasLayoutEngine {
  private static DEFAULT_STYLE: Required<
    Omit<OctopusLayout.LayoutOptions, "containerWidth" | "containerHeight">
  > = {
    defaultFontStyle: "normal",
    defaultFontWeight: "normal",
    defaultFontSize: 14,
    // 兼容iOS，Android设备，保证字体与App一致
    defaultFontFamily:
      "-apple-system, BlinkMacSystemFont, SFProDisplay-Regular, sans-serif",
    defaultColor: "#000000",
    defaultLineHeight: 1.4,
  };

  private ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  private options: Required<OctopusLayout.LayoutOptions>;

  constructor(
    context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    options: OctopusLayout.LayoutOptions
  ) {
    this.ctx = context;
    this.options = {
      ...CanvasLayoutEngine.DEFAULT_STYLE,
      ...options,
    };
  }

  /**
   * 计算文本尺寸
   */
  private measureText(
    text: string,
    style: OctopusLayout.TextStyle = {}
  ): { width: number; height: number } {
    const fontSize = style.fontSize || this.options.defaultFontSize!;
    const fontFamily = style.fontFamily || this.options.defaultFontFamily!;
    const fontWeight = style.fontWeight || this.options.defaultFontWeight;
    const fontStyle = style.fontStyle || this.options.defaultFontStyle;
    const lineHeight = style.lineHeight || this.options.defaultLineHeight!;

    this.ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
    const metrics = this.ctx.measureText(text);

    return {
      width: metrics.width + (style.letterSpacing || 0) * (text.length - 1),
      height: fontSize * lineHeight,
    };
  }

  /**
   * 计算盒模型尺寸
   */
  private calculateBoxSize(node: OctopusLayout.LayoutNode): {
    width: number;
    height: number;
  } {
    const box = node.box || {};
    const padding = box.padding || {};
    const margin = box.margin || {};
    const border = box.border || {};

    const paddingHorizontal = (padding.left || 0) + (padding.right || 0);
    const paddingVertical = (padding.top || 0) + (padding.bottom || 0);
    const marginHorizontal = (margin.left || 0) + (margin.right || 0);
    const marginVertical = (margin.top || 0) + (margin.bottom || 0);
    const borderHorizontal = (border.width || 0) * 2;
    const borderVertical = (border.width || 0) * 2;

    let contentWidth = 0;
    let contentHeight = 0;

    if (node.type === "text" && node.content) {
      const textSize = this.measureText(node.content, node.style);
      contentWidth = textSize.width;
      contentHeight = textSize.height;
    }

    // 如果指定了固定宽高，使用指定值
    if (box.width !== undefined) contentWidth = box.width;
    if (box.height !== undefined) contentHeight = box.height;

    return {
      width:
        contentWidth + paddingHorizontal + borderHorizontal + marginHorizontal,
      height: contentHeight + paddingVertical + borderVertical + marginVertical,
    };
  }

  /**
   * 布局计算
   */
  private layout(
    node: OctopusLayout.LayoutNode,
    parentWidth: number,
    x: number = 0,
    y: number = 0
  ): void {
    const size = this.calculateBoxSize(node);
    node.computedWidth = Math.min(size.width, parentWidth);
    node.computedHeight = size.height;
    node.x = x;
    node.y = y;

    if (node.children && node.children.length > 0) {
      let currentY = y;
      const box = node.box || {};
      const padding = box.padding || {};
      const contentX = x + (padding.left || 0) + (box.border?.width || 0);
      const contentWidth =
        node.computedWidth -
        (padding.left || 0) -
        (padding.right || 0) -
        (box.border?.width || 0) * 2;

      for (const child of node.children) {
        this.layout(
          child,
          contentWidth,
          contentX,
          currentY + (padding.top || 0) + (box.border?.width || 0)
        );
        currentY += child.computedHeight || 0;
      }

      // 重新计算容器高度
      const totalChildrenHeight = node.children.reduce(
        (sum, child) => sum + (child.computedHeight || 0),
        0
      );
      node.computedHeight =
        totalChildrenHeight +
        (padding.top || 0) +
        (padding.bottom || 0) +
        (box.border?.width || 0) * 2;
    }
  }

  /**
   * 渲染文本
   */
  private renderText(node: OctopusLayout.LayoutNode): void {
    if (!node.content || node.type !== "text") return;

    const style = node.style || {};
    const box = node.box || {};
    const padding = box.padding || {};
    const border = box.border || {};

    const fontSize = style.fontSize || this.options.defaultFontSize!;
    const fontFamily = style.fontFamily || this.options.defaultFontFamily!;
    const fontWeight = style.fontWeight || this.options.defaultFontWeight;
    const color = style.color || this.options.defaultColor;
    const textAlign = style.textAlign || "left";

    // 设置字体样式
    const fontStyle = style.fontStyle || this.options.defaultFontStyle;
    this.ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
    this.ctx.fillStyle = color;
    this.ctx.textBaseline = "top";

    // 计算文本位置
    const contentX = (node.x || 0) + (padding.left || 0) + (border.width || 0);
    const contentY = (node.y || 0) + (padding.top || 0) + (border.width || 0);
    const contentWidth =
      (node.computedWidth || 0) -
      (padding.left || 0) -
      (padding.right || 0) -
      (border.width || 0) * 2;

    let textX = contentX;
    if (textAlign === "center") {
      textX = contentX + contentWidth / 2;
      this.ctx.textAlign = "center";
    } else if (textAlign === "right") {
      textX = contentX + contentWidth;
      this.ctx.textAlign = "right";
    } else {
      this.ctx.textAlign = "left";
    }

    // 处理文本换行
    const words = node.content.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine + (currentLine ? " " : "") + word;
      const metrics = this.ctx.measureText(testLine);

      if (metrics.width > contentWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }

    // 渲染每一行
    const lineHeight =
      fontSize * (style.lineHeight || this.options.defaultLineHeight!);
    lines.forEach((line, index) => {
      const lineY = contentY + index * lineHeight;
      this.ctx.fillText(line, textX, lineY);

      // 渲染文本装饰
      if (style.textDecoration === "underline") {
        const lineWidth = this.ctx.measureText(line).width;
        const underlineY = lineY + fontSize;
        this.ctx.beginPath();
        this.ctx.moveTo(
          textAlign === "center" ? textX - lineWidth / 2 : textX,
          underlineY
        );
        this.ctx.lineTo(
          textAlign === "center" ? textX + lineWidth / 2 : textX + lineWidth,
          underlineY
        );
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
      }
    });
  }

  /**
   * 渲染边框和背景
   */
  private renderBox(node: OctopusLayout.LayoutNode): void {
    const box = node.box || {};
    const border = box.border || {};

    if (border.width && border.width > 0) {
      this.ctx.strokeStyle = border.color || "#000000";
      this.ctx.lineWidth = border.width;

      if (border.style === "dashed") {
        this.ctx.setLineDash([5, 5]);
      } else if (border.style === "dotted") {
        this.ctx.setLineDash([2, 2]);
      } else {
        this.ctx.setLineDash([]);
      }

      this.ctx.strokeRect(
        (node.x || 0) + border.width / 2,
        (node.y || 0) + border.width / 2,
        (node.computedWidth || 0) - border.width,
        (node.computedHeight || 0) - border.width
      );
    }
  }

  /**
   * 渲染节点
   */
  private renderNode(node: OctopusLayout.LayoutNode): void {
    this.renderBox(node);

    if (node.type === "text") {
      this.renderText(node);
    }

    if (node.children) {
      for (const child of node.children) {
        this.renderNode(child);
      }
    }
  }

  /**
   * 渲染布局树
   */
  public render(layoutTree: OctopusLayout.LayoutNode): void {
    // 清空画布
    this.ctx.clearRect(
      0,
      0,
      this.options.containerWidth,
      this.options.containerHeight
    );

    // 计算布局
    this.layout(layoutTree, this.options.containerWidth);

    // 渲染
    this.renderNode(layoutTree);
  }

  /**
   * 获取节点在指定位置的信息
   */
  public getNodeAt(
    x: number,
    y: number,
    node: OctopusLayout.LayoutNode
  ): OctopusLayout.LayoutNode | null {
    if (!node.x || !node.y || !node.computedWidth || !node.computedHeight) {
      return null;
    }

    if (
      x >= node.x &&
      x <= node.x + node.computedWidth &&
      y >= node.y &&
      y <= node.y + node.computedHeight
    ) {
      // 检查子节点
      if (node.children) {
        for (const child of node.children) {
          const childNode = this.getNodeAt(x, y, child);
          if (childNode) {
            return childNode;
          }
        }
      }

      return node;
    }

    return null;
  }
}

/**
 * 创建文本节点的辅助函数
 */
export function createTextNode(
  content: string,
  style?: OctopusLayout.TextStyle,
  box?: OctopusLayout.BoxModel
): OctopusLayout.LayoutNode {
  return {
    type: "text",
    content,
    style,
    box,
  };
}

/**
 * 创建容器节点的辅助函数
 */
export function createContainerNode(
  children: OctopusLayout.LayoutNode[],
  box?: OctopusLayout.BoxModel
): OctopusLayout.LayoutNode {
  return {
    type: "container",
    children,
    box,
  };
}

export default CanvasLayoutEngine;
