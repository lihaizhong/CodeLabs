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
    if (style.display === "flex") {
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
    const flexDirection =
      style.flexDirection || OctopusLayout.FlexDirection.ROW;
    const justifyContent =
      style.justifyContent || OctopusLayout.JustifyContent.FLEX_START;
    const alignItems = style.alignItems || OctopusLayout.AlignItems.FLEX_START;
    const flexWrap = style.flexWrap || OctopusLayout.FlexWrap.NOWRAP;

    // 容器的内边距
    const paddingLeft = style.paddingLeft || 0;
    const paddingTop = style.paddingTop || 0;
    const paddingRight = style.paddingRight || 0;
    const paddingBottom = style.paddingBottom || 0;

    // 容器的内部宽度和高度
    const contentWidth = rect.width - paddingLeft - paddingRight;
    const contentHeight = rect.height - paddingTop - paddingBottom;

    // 是否是水平方向的Flex
    const isHorizontal =
      flexDirection === OctopusLayout.FlexDirection.ROW ||
      flexDirection === OctopusLayout.FlexDirection.ROW_REVERSE;

    // 主轴尺寸和交叉轴尺寸
    const mainAxisSize = isHorizontal ? contentWidth : contentHeight;
    const crossAxisSize = isHorizontal ? contentHeight : contentWidth;

    // 是否反向
    const isReverse =
      flexDirection === OctopusLayout.FlexDirection.ROW_REVERSE ||
      flexDirection === OctopusLayout.FlexDirection.COLUMN_REVERSE;

    // 是否需要换行
    const isWrapping = flexWrap !== OctopusLayout.FlexWrap.NOWRAP;
    // 是否反向换行
    const isWrapReverse = flexWrap === OctopusLayout.FlexWrap.WRAP_REVERSE;

    // 根据是否需要换行选择不同的布局算法
    if (isWrapping) {
      this.calculateWrappingFlexLayout(
        node,
        isHorizontal,
        isReverse,
        mainAxisSize,
        crossAxisSize,
        justifyContent,
        alignItems,
        isWrapReverse
      );
    } else {
      this.calculateNonWrappingFlexLayout(
        node,
        isHorizontal,
        isReverse,
        mainAxisSize,
        crossAxisSize,
        justifyContent,
        alignItems
      );
    }
  }

  /**
   * 计算需要换行的Flex布局
   * @param node 容器节点
   * @param isHorizontal 是否是水平方向的Flex
   * @param isReverse 是否反向
   * @param mainAxisSize 主轴尺寸
   * @param crossAxisSize 交叉轴尺寸
   * @param justifyContent 主轴对齐方式
   * @param alignItems 交叉轴对齐方式
   * @param isWrapReverse 是否反向换行
   */
  private calculateWrappingFlexLayout(
    node: LayoutNode,
    isHorizontal: boolean,
    isReverse: boolean,
    mainAxisSize: number,
    crossAxisSize: number,
    justifyContent: OctopusLayout.JustifyContent,
    alignItems: OctopusLayout.AlignItems,
    isWrapReverse: boolean
  ): void {
    const { style, rect, children } = node;

    // 容器的内边距
    const paddingLeft = style.paddingLeft || 0;
    const paddingTop = style.paddingTop || 0;

    // 存储每一行的子节点
    const lines: LayoutNode[][] = [];
    let currentLine: LayoutNode[] = [];
    let currentLineMainAxisSize = 0;

    // 第一遍：将子节点分配到不同的行
    for (const child of children) {
      const childStyle = child.style;
      const childRect = child.rect;

      // 计算子节点在主轴上的尺寸（包括margin）
      const mainSize = isHorizontal ? childRect.width : childRect.height;
      const marginMain = isHorizontal
        ? (childStyle.marginLeft || 0) + (childStyle.marginRight || 0)
        : (childStyle.marginTop || 0) + (childStyle.marginBottom || 0);
      const childTotalMainSize = mainSize + marginMain;

      // 检查当前行是否还有足够空间
      if (
        currentLine.length > 0 &&
        currentLineMainAxisSize + childTotalMainSize > mainAxisSize
      ) {
        // 当前行已满，创建新行
        lines.push(currentLine);
        currentLine = [];
        currentLineMainAxisSize = 0;
      }

      // 当前行有足够空间，添加到当前行
      currentLine.push(child);
      currentLineMainAxisSize += childTotalMainSize;
    }

    // 添加最后一行
    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    // 如果是wrap-reverse，反转行的顺序
    if (isWrapReverse) {
      lines.reverse();
    }

    // 计算每行的交叉轴尺寸
    const lineCrossSizes: number[] = lines.map((line) => {
      let maxCrossSize = 0;

      for (const child of line) {
        const childStyle = child.style;
        const childRect = child.rect;
        const crossSize = isHorizontal ? childRect.height : childRect.width;
        const marginCross = isHorizontal
          ? (childStyle.marginTop || 0) + (childStyle.marginBottom || 0)
          : (childStyle.marginLeft || 0) + (childStyle.marginRight || 0);
        maxCrossSize = Math.max(maxCrossSize, crossSize + marginCross);
      }

      return maxCrossSize;
    });

    // 计算每行的起始交叉轴位置
    let crossAxisPos = 0;
    if (isWrapReverse) {
      crossAxisPos = crossAxisSize - lineCrossSizes[0];
    }

    // 第二遍：为每行中的子节点设置位置
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      const lineCrossSize = lineCrossSizes[lineIndex];

      // 计算当前行的主轴剩余空间
      let lineMainAxisSize = 0;
      for (const child of line) {
        const childStyle = child.style;
        const childRect = child.rect;
        const mainSize = isHorizontal ? childRect.width : childRect.height;
        const marginMain = isHorizontal
          ? (childStyle.marginLeft || 0) + (childStyle.marginRight || 0)
          : (childStyle.marginTop || 0) + (childStyle.marginBottom || 0);
        lineMainAxisSize += mainSize + marginMain;
      }

      // 计算当前行的主轴起始位置
      let lineMainAxisPos = isReverse ? mainAxisSize : 0;
      const lineRemainingSpace = mainAxisSize - lineMainAxisSize;

      // 根据justifyContent计算主轴起始位置
      if (lineRemainingSpace > 0) {
        switch (justifyContent) {
          case OctopusLayout.JustifyContent.FLEX_END:
            lineMainAxisPos = isReverse ? 0 : lineRemainingSpace;
            break;
          case OctopusLayout.JustifyContent.CENTER:
            lineMainAxisPos = isReverse
              ? lineRemainingSpace / 2
              : lineRemainingSpace / 2;
            break;
          case OctopusLayout.JustifyContent.SPACE_BETWEEN:
            if (line.length > 1) {
              // 在第一个和最后一个子节点之间平均分配空间
              // 保持默认位置，后续会调整间距
            }
            break;
          case OctopusLayout.JustifyContent.SPACE_AROUND:
            if (line.length > 0) {
              // 在每个子节点周围平均分配空间
              const spacePerSide = lineRemainingSpace / (line.length * 2);
              lineMainAxisPos = isReverse
                ? lineMainAxisPos - spacePerSide
                : lineMainAxisPos + spacePerSide;
            }
            break;
          case OctopusLayout.JustifyContent.SPACE_EVENLY:
            if (line.length > 0) {
              // 在每个子节点之间和周围平均分配空间
              const spacesCount = line.length + 1;
              const spaceSize = lineRemainingSpace / spacesCount;
              lineMainAxisPos = isReverse
                ? lineMainAxisPos - spaceSize
                : lineMainAxisPos + spaceSize;
            }
            break;
          default:
            lineMainAxisPos = isReverse ? mainAxisSize : 0;
        }
      }

      // 为当前行的每个子节点设置位置
      for (const child of line) {
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
          childMainPos =
            lineMainAxisPos -
            mainSize -
            (isHorizontal ? marginRight : marginBottom);
          lineMainAxisPos -=
            mainSize +
            (isHorizontal
              ? marginLeft + marginRight
              : marginTop + marginBottom);

          // 处理space-between, space-around和space-evenly的间距
          if (
            justifyContent === OctopusLayout.JustifyContent.SPACE_BETWEEN &&
            line.length > 1
          ) {
            const spaceBetween = lineRemainingSpace / (line.length - 1);
            lineMainAxisPos -= spaceBetween;
          } else if (
            justifyContent === OctopusLayout.JustifyContent.SPACE_AROUND &&
            line.length > 0
          ) {
            const spacePerSide = lineRemainingSpace / (line.length * 2);
            lineMainAxisPos -= spacePerSide * 2;
          } else if (
            justifyContent === OctopusLayout.JustifyContent.SPACE_EVENLY &&
            line.length > 0
          ) {
            const spacesCount = line.length + 1;
            const spaceSize = lineRemainingSpace / spacesCount;
            lineMainAxisPos -= spaceSize;
          }
        } else {
          childMainPos =
            lineMainAxisPos + (isHorizontal ? marginLeft : marginTop);
          lineMainAxisPos +=
            mainSize +
            (isHorizontal
              ? marginLeft + marginRight
              : marginTop + marginBottom);

          // 处理space-between, space-around和space-evenly的间距
          if (
            justifyContent === OctopusLayout.JustifyContent.SPACE_BETWEEN &&
            line.length > 1
          ) {
            const spaceBetween = lineRemainingSpace / (line.length - 1);
            lineMainAxisPos += spaceBetween;
          } else if (
            justifyContent === OctopusLayout.JustifyContent.SPACE_AROUND &&
            line.length > 0
          ) {
            const spacePerSide = lineRemainingSpace / (line.length * 2);
            lineMainAxisPos += spacePerSide * 2;
          } else if (
            justifyContent === OctopusLayout.JustifyContent.SPACE_EVENLY &&
            line.length > 0
          ) {
            const spacesCount = line.length + 1;
            const spaceSize = lineRemainingSpace / spacesCount;
            lineMainAxisPos += spaceSize;
          }
        }

        // 计算子节点在交叉轴上的位置
        let childCrossPos;
        switch (alignItems) {
          case OctopusLayout.AlignItems.FLEX_END:
            childCrossPos =
              crossAxisPos +
              lineCrossSize -
              crossSize -
              (isHorizontal ? marginBottom : marginRight);
            break;
          case OctopusLayout.AlignItems.CENTER:
            childCrossPos =
              crossAxisPos +
              (lineCrossSize - crossSize) / 2 +
              (isHorizontal
                ? marginTop - marginBottom
                : marginLeft - marginRight) /
                2;
            break;
          case OctopusLayout.AlignItems.STRETCH:
            // 拉伸到行的交叉轴尺寸
            // 这里简化处理，实际实现需要调整子节点尺寸
            childCrossPos =
              crossAxisPos + (isHorizontal ? marginTop : marginLeft);
            break;
          default: // FLEX_START
            childCrossPos =
              crossAxisPos + (isHorizontal ? marginTop : marginLeft);
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

      // 更新交叉轴位置，为下一行做准备
      if (isWrapReverse) {
        crossAxisPos -=
          lineIndex + 1 < lines.length ? lineCrossSizes[lineIndex + 1] : 0;
      } else {
        crossAxisPos += lineCrossSize;
      }
    }
  }

  /**
   * 计算不需要换行的Flex布局
   * @param node 容器节点
   * @param isHorizontal 是否是水平方向的Flex
   * @param isReverse 是否反向
   * @param mainAxisSize 主轴尺寸
   * @param crossAxisSize 交叉轴尺寸
   * @param justifyContent 主轴对齐方式
   * @param alignItems 交叉轴对齐方式
   */
  private calculateNonWrappingFlexLayout(
    node: LayoutNode,
    isHorizontal: boolean,
    isReverse: boolean,
    mainAxisSize: number,
    crossAxisSize: number,
    justifyContent: OctopusLayout.JustifyContent,
    alignItems: OctopusLayout.AlignItems
  ): void {
    const { style, rect, children } = node;

    // 容器的内边距
    const paddingLeft = style.paddingLeft || 0;
    const paddingTop = style.paddingTop || 0;

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
        case OctopusLayout.JustifyContent.FLEX_END:
          mainAxisPos = isReverse ? 0 : remainingSpace;
          break;
        case OctopusLayout.JustifyContent.CENTER:
          mainAxisPos = isReverse ? remainingSpace / 2 : remainingSpace / 2;
          break;
        case OctopusLayout.JustifyContent.SPACE_BETWEEN:
          // 在第一个和最后一个子节点之间平均分配空间
          if (children.length > 1) {
            // 保持默认位置，后续会调整间距
          }
          break;
        case OctopusLayout.JustifyContent.SPACE_AROUND:
          if (children.length > 0) {
            // 在每个子节点周围平均分配空间
            const spacePerSide = remainingSpace / (children.length * 2);
            mainAxisPos = isReverse
              ? mainAxisPos - spacePerSide
              : mainAxisPos + spacePerSide;
          }
          break;
        case OctopusLayout.JustifyContent.SPACE_EVENLY:
          if (children.length > 0) {
            // 在每个子节点之间和周围平均分配空间
            const spacesCount = children.length + 1;
            const spaceSize = remainingSpace / spacesCount;
            mainAxisPos = isReverse
              ? mainAxisPos - spaceSize
              : mainAxisPos + spaceSize;
          }
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
        childMainPos =
          mainAxisPos - mainSize - (isHorizontal ? marginRight : marginBottom);
        mainAxisPos -=
          mainSize +
          (isHorizontal ? marginLeft + marginRight : marginTop + marginBottom);

        // 处理space-between, space-around和space-evenly的间距
        if (
          justifyContent === OctopusLayout.JustifyContent.SPACE_BETWEEN &&
          children.length > 1
        ) {
          const spaceBetween = remainingSpace / (children.length - 1);
          mainAxisPos -= spaceBetween;
        } else if (
          justifyContent === OctopusLayout.JustifyContent.SPACE_AROUND &&
          children.length > 0
        ) {
          const spacePerSide = remainingSpace / (children.length * 2);
          mainAxisPos -= spacePerSide * 2;
        } else if (
          justifyContent === OctopusLayout.JustifyContent.SPACE_EVENLY &&
          children.length > 0
        ) {
          const spacesCount = children.length + 1;
          const spaceSize = remainingSpace / spacesCount;
          mainAxisPos -= spaceSize;
        }
      } else {
        childMainPos = mainAxisPos + (isHorizontal ? marginLeft : marginTop);
        mainAxisPos +=
          mainSize +
          (isHorizontal ? marginLeft + marginRight : marginTop + marginBottom);

        // 处理space-between, space-around和space-evenly的间距
        if (
          justifyContent === OctopusLayout.JustifyContent.SPACE_BETWEEN &&
          children.length > 1
        ) {
          const spaceBetween = remainingSpace / (children.length - 1);
          mainAxisPos += spaceBetween;
        } else if (
          justifyContent === OctopusLayout.JustifyContent.SPACE_AROUND &&
          children.length > 0
        ) {
          const spacePerSide = remainingSpace / (children.length * 2);
          mainAxisPos += spacePerSide * 2;
        } else if (
          justifyContent === OctopusLayout.JustifyContent.SPACE_EVENLY &&
          children.length > 0
        ) {
          const spacesCount = children.length + 1;
          const spaceSize = remainingSpace / spacesCount;
          mainAxisPos += spaceSize;
        }
      }

      // 计算子节点在交叉轴上的位置
      let childCrossPos;
      switch (alignItems) {
        case OctopusLayout.AlignItems.FLEX_END:
          childCrossPos =
            crossAxisSize -
            crossSize -
            (isHorizontal ? marginBottom : marginRight);
          break;
        case OctopusLayout.AlignItems.CENTER:
          childCrossPos =
            (crossAxisSize - crossSize) / 2 +
            (isHorizontal
              ? marginTop - marginBottom
              : marginLeft - marginRight) /
              2;
          break;
        case OctopusLayout.AlignItems.STRETCH:
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
    const { paddingLeft } = style;

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
      const marginBottom = childStyle.marginBottom || 0;

      // 设置子节点位置
      const childX = paddingLeft + marginLeft;
      const childY = currentY + marginTop;

      // 设置子节点的最终位置
      child.setPosition(rect.x + childX, rect.y + childY);

      // 更新当前行高度
      currentLineHeight = Math.max(
        currentLineHeight,
        childRect.height + marginTop + marginBottom
      );

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
    font: string,
    maxWidth: number,
    lineHeight: number
  ): OctopusLayout.TextMetrics {
    if (!text) {
      return { width: 0, height: 0, lines: [] };
    }

    const { context } = this;

    context.font = font;
    // 如果没有最大宽度限制或文本宽度小于最大宽度，不需要换行
    const metrics = context.measureText(text);
    if (!maxWidth || metrics.width <= maxWidth) {
      return {
        width: metrics.width,
        height: lineHeight,
        lines: [text],
      };
    }

    // 需要换行处理
    return this.breakTextIntoLines(text, maxWidth, lineHeight);
  }

  /**
   * 将文本按照最大宽度断行
   */
  private breakTextIntoLines(
    text: string,
    maxWidth: number,
    lineHeight: number
  ): OctopusLayout.TextMetrics {
    const { context } = this;

    const chars = text.split("");
    const lines: string[] = [];
    // 处理英文单词截断
    const wordExec = {
      word: "",
      needExtract: (c: string) => !/[a-zA-Z]/.test(c),
      appendChar(c: string) {
        // 如果是字母，添加到当前单词中
        if (!this.needExtract(c)) {
          this.word += c;
        } else if (this.word !== "") {
          this.word = "";
        }
      },
      extractWord(str: string) {
        return str.slice(-this.word.length);
      },
      clear() {
        this.word = "";
      }
    };
    const measureTextWidth = (str: string) => Math.max(
      maxLineWidth,
      context.measureText(str).width
    )
    let currentLine = "";
    let maxLineWidth = 0;

    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      const testLine = currentLine + char;
      const metrics = context.measureText(testLine);

      if (metrics.width <= maxWidth || !currentLine) {
        currentLine = testLine;
        wordExec.appendChar(char);
      } else {
        // 处理单词截断
        if (!wordExec.needExtract(char)) {
          currentLine = wordExec.extractWord(currentLine);
        }

        // 处理截取完后是空行
        if (currentLine === "") {
          currentLine = wordExec.word;
          wordExec.clear();
        }

        lines.push(currentLine);
        maxLineWidth = measureTextWidth(currentLine);
        wordExec.appendChar(char);
        currentLine = wordExec.word;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
      maxLineWidth = measureTextWidth(currentLine);
    }

    return {
      width: maxLineWidth,
      height: lines.length * lineHeight,
      lines,
    };
  }
}
