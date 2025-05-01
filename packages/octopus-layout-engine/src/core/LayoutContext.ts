import { AlignItems, FlexDirection, FlexWrap, JustifyContent, TextMetrics } from "../types";
import { LayoutNode } from "./LayoutNode";

/**
 * 布局上下文实现类
 * 提供布局计算所需的环境和工具方法
 */
export class LayoutContext {
  constructor(
    private readonly context:
      | CanvasRenderingContext2D
      | OffscreenCanvasRenderingContext2D
  ) {}

  /**
   * 计算布局
   * @param node 根节点
   */
  calculateLayout(node: LayoutNode): void {
    // 首先测量节点尺寸
    node.measure(this);

    // 根据节点的display属性选择布局算法
    const { style } = node;
    if (style.display === 'flex') {
      this.calculateFlexLayout(node);
    } else {
      this.calculateFlowLayout(node);
    }
  }

  /**
   * 计算Flex布局
   * @param node 容器节点
   */
  private calculateFlexLayout(node: LayoutNode): void {
    const { style, rect, children } = node;
    if (children.length === 0) return;

    // 获取Flex相关样式属性
    const flexDirection = style.flexDirection || FlexDirection.ROW;
    const justifyContent = style.justifyContent || JustifyContent.FLEX_START;
    const alignItems = style.alignItems || AlignItems.FLEX_START;
    const flexWrap = style.flexWrap || FlexWrap.NOWRAP;

    // 容器的内边距
    const paddingLeft = style.paddingLeft || 0;
    const paddingTop = style.paddingTop || 0;
    const paddingRight = style.paddingRight || 0;
    const paddingBottom = style.paddingBottom || 0;

    // 容器的内部宽度和高度
    const innerWidth = rect.width - paddingLeft - paddingRight;
    const innerHeight = rect.height - paddingTop - paddingBottom;

    // 是否是水平方向的Flex
    const isHorizontal = flexDirection === FlexDirection.ROW || 
                         flexDirection === FlexDirection.ROW_REVERSE;

    // 主轴尺寸和交叉轴尺寸
    const mainAxisSize = isHorizontal ? innerWidth : innerHeight;
    const crossAxisSize = isHorizontal ? innerHeight : innerWidth;

    // 是否反向
    const isReverse = flexDirection === FlexDirection.ROW_REVERSE || 
                      flexDirection === FlexDirection.COLUMN_REVERSE;

    // 计算子节点的flex属性总和
    let totalFlexGrow = 0;
    let totalFlexShrink = 0;
    let totalFixedMainSize = 0;
    let flexibleChildrenCount = 0;

    // 第一遍：计算固定尺寸的总和和弹性系数
    for (const child of children) {
      const childStyle = child.style;
      const childRect = child.rect;
      const flexGrow = childStyle.flexGrow || 0;
      const flexShrink = childStyle.flexShrink || 1;

      // 计算子节点在主轴上的尺寸
      const mainSize = isHorizontal ? childRect.width : childRect.height;
      const marginMain = isHorizontal 
        ? (childStyle.marginLeft || 0) + (childStyle.marginRight || 0)
        : (childStyle.marginTop || 0) + (childStyle.marginBottom || 0);

      if (flexGrow > 0) {
        flexibleChildrenCount++;
        totalFlexGrow += flexGrow;
      } else {
        totalFixedMainSize += mainSize + marginMain;
      }

      totalFlexShrink += flexShrink;
    }

    // 计算剩余空间
    let remainingSpace = mainAxisSize - totalFixedMainSize;
    const isShrinking = remainingSpace < 0;

    // 第二遍：分配空间并设置位置
    let mainAxisPos = isReverse ? mainAxisSize : 0;
    let crossAxisPos = 0;

    // 根据justifyContent计算主轴起始位置
    if (!isShrinking) {
      switch (justifyContent) {
        case JustifyContent.FLEX_END:
          mainAxisPos = isReverse ? 0 : remainingSpace;
          break;
        case JustifyContent.CENTER:
          mainAxisPos = isReverse ? remainingSpace / 2 : remainingSpace / 2;
          break;
        case JustifyContent.SPACE_BETWEEN:
          // 在第一个和最后一个子节点之间平均分配空间
          // 这里简化处理，实际实现需要考虑子节点数量
          break;
        case JustifyContent.SPACE_AROUND:
          // 在每个子节点周围平均分配空间
          // 这里简化处理，实际实现需要考虑子节点数量
          break;
        case JustifyContent.SPACE_EVENLY:
          // 在每个子节点之间和周围平均分配空间
          // 这里简化处理，实际实现需要考虑子节点数量
          break;
        default:
          mainAxisPos = isReverse ? mainAxisSize : 0;
      }
    }

    // 为每个子节点设置位置
    for (const child of children) {
      const childStyle = child.style;
      const childRect = child.rect;

      // 计算子节点的margin
      const marginLeft = childStyle.marginLeft || 0;
      const marginTop = childStyle.marginTop || 0;
      const marginRight = childStyle.marginRight || 0;
      const marginBottom = childStyle.marginBottom || 0;

      // 计算子节点在主轴和交叉轴上的尺寸
      const mainSize = isHorizontal ? childRect.width : childRect.height;
      const crossSize = isHorizontal ? childRect.height : childRect.width;

      // 计算子节点在主轴上的位置
      let childMainPos;
      if (isReverse) {
        childMainPos = mainAxisPos - mainSize - (isHorizontal ? marginRight : marginBottom);
        mainAxisPos -= mainSize + (isHorizontal ? marginLeft + marginRight : marginTop + marginBottom);
      } else {
        childMainPos = mainAxisPos + (isHorizontal ? marginLeft : marginTop);
        mainAxisPos += mainSize + (isHorizontal ? marginLeft + marginRight : marginTop + marginBottom);
      }

      // 计算子节点在交叉轴上的位置
      let childCrossPos;
      switch (alignItems) {
        case AlignItems.FLEX_END:
          childCrossPos = crossAxisSize - crossSize - (isHorizontal ? marginBottom : marginRight);
          break;
        case AlignItems.CENTER:
          childCrossPos = (crossAxisSize - crossSize) / 2 + (isHorizontal ? marginTop - marginBottom : marginLeft - marginRight) / 2;
          break;
        case AlignItems.STRETCH:
          // 拉伸到容器交叉轴尺寸
          // 这里简化处理，实际实现需要调整子节点尺寸
          childCrossPos = isHorizontal ? marginTop : marginLeft;
          break;
        default: // FLEX_START
          childCrossPos = isHorizontal ? marginTop : marginLeft;
      }

      // 设置子节点的最终位置
      const childX = isHorizontal ? childMainPos : childCrossPos;
      const childY = isHorizontal ? childCrossPos : childMainPos;

      // 考虑容器的内边距
      const finalX = rect.x + paddingLeft + childX;
      const finalY = rect.y + paddingTop + childY;

      // 设置子节点位置
      child.setPosition(finalX, finalY);

      // 递归计算子节点的布局
      this.calculateLayout(child);
    }
  }

  /**
   * 计算流式布局
   * @param node 容器节点
   */
  private calculateFlowLayout(node: LayoutNode): void {
    const { style, rect, children } = node;
    if (children.length === 0) return;

    // 容器的内边距
    const paddingLeft = style.paddingLeft || 0;
    const paddingTop = style.paddingTop || 0;
    const paddingRight = style.paddingRight || 0;
    const paddingBottom = style.paddingBottom || 0;

    // 容器的内部宽度和高度
    const innerWidth = rect.width - paddingLeft - paddingRight;
    const innerHeight = rect.height - paddingTop - paddingBottom;

    // 当前行的Y坐标和高度
    let currentY = 0;
    let currentLineHeight = 0;

    // 为每个子节点设置位置
    for (const child of children) {
      const childStyle = child.style;
      const childRect = child.rect;

      // 计算子节点的margin
      const marginLeft = childStyle.marginLeft || 0;
      const marginTop = childStyle.marginTop || 0;
      const marginRight = childStyle.marginRight || 0;
      const marginBottom = childStyle.marginBottom || 0;

      // 子节点的总宽度（包括margin）
      const childTotalWidth = childRect.width + marginLeft + marginRight;

      // 设置子节点位置
      const childX = paddingLeft + marginLeft;
      const childY = currentY + marginTop;

      // 设置子节点的最终位置
      child.setPosition(rect.x + childX, rect.y + childY);

      // 更新当前行高度
      currentLineHeight = Math.max(currentLineHeight, childRect.height + marginTop + marginBottom);

      // 更新Y坐标，为下一个子节点做准备
      currentY += currentLineHeight;

      // 递归计算子节点的布局
      this.calculateLayout(child);
    }
  }

  /**
   * 测量文本尺寸
   * @param text 要测量的文本
   * @param fontSize 字体大小
   * @param fontFamily 字体族
   * @param maxWidth 最大宽度，用于计算换行
   * @param lineHeight 行高
   */
  measureText(
    text: string,
    fontSize: number,
    fontFamily: string = "sans-serif",
    maxWidth?: number,
    lineHeight?: number
  ): TextMetrics {
    if (!text) {
      return { width: 0, height: 0, lines: [] };
    }

    const actualLineHeight = lineHeight || fontSize * 1.2;
    this.context.font = `${fontSize}px ${fontFamily}`;

    // 如果没有最大宽度限制或文本宽度小于最大宽度，不需要换行
    const metrics = this.context.measureText(text);
    if (!maxWidth || metrics.width <= maxWidth) {
      return {
        width: metrics.width,
        height: actualLineHeight,
        lines: [text],
      };
    }

    // 需要换行处理
    return this.breakTextIntoLines(
      text,
      fontSize,
      fontFamily,
      maxWidth,
      actualLineHeight
    );
  }

  /**
   * 将文本按照最大宽度断行
   */
  private breakTextIntoLines(
    text: string,
    fontSize: number,
    fontFamily: string,
    maxWidth: number,
    lineHeight: number
  ): TextMetrics {
    this.context.font = `${fontSize}px ${fontFamily}`;
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";
    let maxLineWidth = 0;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = this.context.measureText(testLine);

      if (metrics.width <= maxWidth || !currentLine) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        maxLineWidth = Math.max(
          maxLineWidth,
          this.context.measureText(currentLine).width
        );
        currentLine = word;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
      maxLineWidth = Math.max(
        maxLineWidth,
        this.context.measureText(currentLine).width
      );
    }

    return {
      width: maxLineWidth,
      height: lines.length * lineHeight,
      lines,
    };
  }

  /**
   * 测量中文文本，按字符分割
   * 针对中文等不使用空格分词的语言
   */
  measureCJKText(
    text: string,
    fontSize: number,
    fontFamily: string = "sans-serif",
    maxWidth?: number,
    lineHeight?: number
  ): TextMetrics {
    if (!text) {
      return { width: 0, height: 0, lines: [] };
    }

    const actualLineHeight = lineHeight || fontSize * 1.2;
    this.context.font = `${fontSize}px ${fontFamily}`;

    // 如果没有最大宽度限制或文本宽度小于最大宽度，不需要换行
    const metrics = this.context.measureText(text);
    if (!maxWidth || metrics.width <= maxWidth) {
      return {
        width: metrics.width,
        height: actualLineHeight,
        lines: [text],
      };
    }

    // 需要换行处理，按字符分割
    return this.breakCJKTextIntoLines(
      text,
      fontSize,
      fontFamily,
      maxWidth,
      actualLineHeight
    );
  }

  /**
   * 将中文文本按照最大宽度断行，按字符分割
   */
  private breakCJKTextIntoLines(
    text: string,
    fontSize: number,
    fontFamily: string,
    maxWidth: number,
    lineHeight: number
  ): TextMetrics {
    this.context.font = `${fontSize}px ${fontFamily}`;
    const chars = Array.from(text); // 将文本拆分为字符数组
    const lines: string[] = [];
    let currentLine = "";
    let maxLineWidth = 0;

    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      const testLine = currentLine + char;
      const metrics = this.context.measureText(testLine);

      if (metrics.width <= maxWidth || !currentLine) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        maxLineWidth = Math.max(
          maxLineWidth,
          this.context.measureText(currentLine).width
        );
        currentLine = char;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
      maxLineWidth = Math.max(
        maxLineWidth,
        this.context.measureText(currentLine).width
      );
    }

    return {
      width: maxLineWidth,
      height: lines.length * lineHeight,
      lines,
    };
  }
}
