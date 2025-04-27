import { LayoutContext } from '../core/LayoutContext';
import { LayoutNode } from '../core/LayoutNode';
import { TextAlign, VerticalAlign } from '../types';

/**
 * 流式布局算法
 * 实现类似HTML中的流式布局，元素从左到右、从上到下排列
 */
export class FlowLayout {
  /**
   * 执行流式布局
   * @param rootNode 根节点
   * @param context 布局上下文
   */
  layout(rootNode: LayoutNode, context: LayoutContext): void {
    // 首先测量所有节点的尺寸
    rootNode.measure(context);
    
    // 从根节点开始布局
    this.layoutNode(rootNode, 0, 0, context);
  }
  
  /**
   * 对单个节点及其子节点进行布局
   * @param node 当前节点
   * @param x 起始X坐标
   * @param y 起始Y坐标
   * @param context 布局上下文
   */
  private layoutNode(node: LayoutNode, x: number, y: number, context: LayoutContext): number {
    const style = node.getStyle();
    const rect = node.getRect();
    
    // 应用外边距
    const marginTop = style.marginTop || 0;
    const marginLeft = style.marginLeft || 0;
    
    // 计算节点位置
    rect.x = x + marginLeft;
    rect.y = y + marginTop;
    
    // 应用内边距
    const paddingTop = style.paddingTop || 0;
    const paddingLeft = style.paddingLeft || 0;
    const paddingRight = style.paddingRight || 0;
    const paddingBottom = style.paddingBottom || 0;
    
    // 子节点的起始位置
    let childX = rect.x + paddingLeft;
    let childY = rect.y + paddingTop;
    let lineHeight = 0;
    let currentLineWidth = 0;
    
    // 布局子节点
    const children = node.getChildren();
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const childRect = child.getRect();
      const childStyle = child.getStyle();
      const childMarginRight = childStyle.marginRight || 0;
      const childMarginBottom = childStyle.marginBottom || 0;
      
      // 检查是否需要换行
      if (currentLineWidth > 0 && currentLineWidth + childRect.width > rect.width - paddingLeft - paddingRight) {
        childX = rect.x + paddingLeft;
        childY += lineHeight;
        lineHeight = 0;
        currentLineWidth = 0;
      }
      
      // 布局子节点
      const childLineHeight = this.layoutNode(child, childX, childY, context);
      
      // 更新行高和当前行宽度
      lineHeight = Math.max(lineHeight, childLineHeight + childMarginBottom);
      childX += childRect.width + childMarginRight;
      currentLineWidth += childRect.width + childMarginRight;
    }
    
    // 处理文本对齐
    if (children.length > 0 && style.textAlign) {
      this.alignChildrenInLine(node, style.textAlign);
    }
    
    // 处理垂直对齐
    if (children.length > 0 && style.verticalAlign) {
      this.alignChildrenVertically(node, style.verticalAlign);
    }
    
    // 返回节点高度（包括内边距和子节点）
    return rect.height + paddingTop + paddingBottom;
  }
  
  /**
   * 处理文本水平对齐
   * @param node 容器节点
   * @param align 对齐方式
   */
  private alignChildrenInLine(node: LayoutNode, align: TextAlign): void {
    const rect = node.getRect();
    const style = node.getStyle();
    const children = node.getChildren();
    const paddingLeft = style.paddingLeft || 0;
    const paddingRight = style.paddingRight || 0;
    
    // 计算容器内可用宽度
    const availableWidth = rect.width - paddingLeft - paddingRight;
    
    // 按行分组子节点
    const lines: LayoutNode[][] = [];
    let currentLine: LayoutNode[] = [];
    let currentLineWidth = 0;
    
    for (const child of children) {
      const childRect = child.getRect();
      const childStyle = child.getStyle();
      const childMarginRight = childStyle.marginRight || 0;
      
      // 检查是否需要换行
      if (currentLineWidth > 0 && currentLineWidth + childRect.width > availableWidth) {
        lines.push(currentLine);
        currentLine = [child];
        currentLineWidth = childRect.width + childMarginRight;
      } else {
        currentLine.push(child);
        currentLineWidth += childRect.width + childMarginRight;
      }
    }
    
    // 添加最后一行
    if (currentLine.length > 0) {
      lines.push(currentLine);
    }
    
    // 对每行进行对齐
    for (const line of lines) {
      // 计算行宽
      let lineWidth = 0;
      for (const child of line) {
        const childRect = child.getRect();
        const childStyle = child.getStyle();
        const childMarginRight = childStyle.marginRight || 0;
        lineWidth += childRect.width + childMarginRight;
      }
      
      // 根据对齐方式调整子节点位置
      let offset = 0;
      if (align === TextAlign.CENTER) {
        offset = (availableWidth - lineWidth) / 2;
      } else if (align === TextAlign.RIGHT) {
        offset = availableWidth - lineWidth;
      } else if (align === TextAlign.JUSTIFY && line.length > 1 && lines[lines.length - 1] !== line) {
        // 两端对齐（除了最后一行）
        const spacing = (availableWidth - lineWidth) / (line.length - 1);
        let currentOffset = 0;
        
        for (let i = 0; i < line.length; i++) {
          const child = line[i];
          const childRect = child.getRect();
          childRect.x += currentOffset;
          
          if (i < line.length - 1) {
            currentOffset += spacing;
          }
        }
        
        continue; // 跳过下面的循环，因为已经处理了两端对齐
      }
      
      // 应用偏移量
      if (offset > 0) {
        for (const child of line) {
          const childRect = child.getRect();
          childRect.x += offset;
        }
      }
    }
  }
  
  /**
   * 处理垂直对齐
   * @param node 容器节点
   * @param align 对齐方式
   */
  private alignChildrenVertically(node: LayoutNode, align: VerticalAlign): void {
    const rect = node.getRect();
    const style = node.getStyle();
    const children = node.getChildren();
    const paddingTop = style.paddingTop || 0;
    const paddingBottom = style.paddingBottom || 0;
    
    // 计算容器内可用高度
    const availableHeight = rect.height - paddingTop - paddingBottom;
    
    // 计算子节点总高度
    let totalHeight = 0;
    for (const child of children) {
      const childRect = child.getRect();
      const childStyle = child.getStyle();
      const childMarginBottom = childStyle.marginBottom || 0;
      totalHeight += childRect.height + childMarginBottom;
    }
    
    // 根据对齐方式调整子节点位置
    let offset = 0;
    if (align === VerticalAlign.MIDDLE) {
      offset = (availableHeight - totalHeight) / 2;
    } else if (align === VerticalAlign.BOTTOM) {
      offset = availableHeight - totalHeight;
    }
    
    // 应用偏移量
    if (offset > 0) {
      for (const child of children) {
        const childRect = child.getRect();
        childRect.y += offset;
      }
    }
  }
}