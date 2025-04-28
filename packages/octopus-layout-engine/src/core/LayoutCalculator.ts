import { LayoutNode } from './LayoutNode';
import { LayoutContext } from './LayoutContext';
import {
  AlignItems,
  FlexDirection,
  FlexWrap,
  JustifyContent,
} from '../types';

/**
 * 布局计算器
 * 负责计算节点的位置和尺寸
 */
export class LayoutCalculator {
  private context: LayoutContext;

  constructor(context: LayoutContext) {
    this.context = context;
  }

  /**
   * 计算布局
   * @param node 根节点
   */
  calculateLayout(node: LayoutNode): void {
    // 首先测量节点尺寸
    node.measure(this.context);

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
}