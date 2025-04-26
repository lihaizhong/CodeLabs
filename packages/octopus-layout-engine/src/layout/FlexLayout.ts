// Copyright 2025 LiHZSky
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     https://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { LayoutContext } from '../core/LayoutContext';
import { LayoutNode } from '../core/LayoutNode';
import { AlignItems, FlexDirection, FlexWrap, JustifyContent } from '../types';

/**
 * Flex布局算法
 * 实现类似CSS Flexbox的布局算法
 */
export class FlexLayout {
  /**
   * 执行Flex布局
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
  private layoutNode(node: LayoutNode, x: number, y: number, context: LayoutContext): void {
    const style = node.getStyle();
    const rect = node.getRect();
    
    // 应用外边距
    const marginTop = style.marginTop || 0;
    const marginLeft = style.marginLeft || 0;
    
    // 计算节点位置
    rect.x = x + marginLeft;
    rect.y = y + marginTop;
    
    // 如果是Flex容器，使用Flex布局
    if (style.display === 'flex') {
      this.layoutFlexContainer(node, context);
    } else {
      // 非Flex容器，递归布局子节点
      const children = node.getChildren();
      const paddingLeft = style.paddingLeft || 0;
      const paddingTop = style.paddingTop || 0;
      
      for (const child of children) {
        this.layoutNode(child, rect.x + paddingLeft, rect.y + paddingTop, context);
      }
    }
  }
  
  /**
   * 对Flex容器进行布局
   * @param container Flex容器节点
   * @param context 布局上下文
   */
  private layoutFlexContainer(container: LayoutNode, context: LayoutContext): void {
    const style = container.getStyle();
    const rect = container.getRect();
    const children = container.getChildren();
    
    if (children.length === 0) {
      return;
    }
    
    // 获取Flex相关属性
    const flexDirection = style.flexDirection || FlexDirection.ROW;
    const justifyContent = style.justifyContent || JustifyContent.FLEX_START;
    const alignItems = style.alignItems || AlignItems.STRETCH;
    const flexWrap = style.flexWrap || FlexWrap.NOWRAP;
    
    // 应用内边距
    const paddingLeft = style.paddingLeft || 0;
    const paddingTop = style.paddingTop || 0;
    const paddingRight = style.paddingRight || 0;
    const paddingBottom = style.paddingBottom || 0;
    
    // 计算主轴和交叉轴的尺寸
    const isHorizontal = flexDirection === FlexDirection.ROW || flexDirection === FlexDirection.ROW_REVERSE;
    const mainAxisSize = isHorizontal ? rect.width - paddingLeft - paddingRight : rect.height - paddingTop - paddingBottom;
    const crossAxisSize = isHorizontal ? rect.height - paddingTop - paddingBottom : rect.width - paddingLeft - paddingRight;
    
    // 计算Flex项目的尺寸和位置
    if (flexWrap === FlexWrap.NOWRAP) {
      // 不换行的情况
      this.layoutFlexItemsNoWrap(container, mainAxisSize, crossAxisSize, isHorizontal, flexDirection, justifyContent, alignItems);
    } else {
      // 换行的情况
      this.layoutFlexItemsWrap(container, mainAxisSize, crossAxisSize, isHorizontal, flexDirection, justifyContent, alignItems, flexWrap);
    }
  }
  
  /**
   * 布局不换行的Flex项目
   */
  private layoutFlexItemsNoWrap(
    container: LayoutNode,
    mainAxisSize: number,
    crossAxisSize: number,
    isHorizontal: boolean,
    flexDirection: FlexDirection,
    justifyContent: JustifyContent,
    alignItems: AlignItems
  ): void {
    const style = container.getStyle();
    const rect = container.getRect();
    const children = container.getChildren();
    
    // 应用内边距
    const paddingLeft = style.paddingLeft || 0;
    const paddingTop = style.paddingTop || 0;
    const paddingRight = style.paddingRight || 0;
    const paddingBottom = style.paddingBottom || 0;
    
    // 计算Flex项目的总尺寸和弹性空间
    let totalFlexGrow = 0;
    let totalFlexShrink = 0;
    let totalFixedMainSize = 0;
    
    for (const child of children) {
      const childStyle = child.getStyle();
      const childRect = child.getRect();
      
      totalFlexGrow += childStyle.flexGrow || 0;
      totalFlexShrink += childStyle.flexShrink || 1;
      totalFixedMainSize += isHorizontal ? childRect.width : childRect.height;
    }
    
    // 计算剩余空间
    let remainingSpace = mainAxisSize - totalFixedMainSize;
    
    // 分配空间给Flex项目
    if (remainingSpace > 0 && totalFlexGrow > 0) {
      // 有剩余空间，根据flex-grow分配
      for (const child of children) {
        const childStyle = child.getStyle();
        const childRect = child.getRect();
        const flexGrow = childStyle.flexGrow || 0;
        
        if (flexGrow > 0) {
          const extraSpace = (flexGrow / totalFlexGrow) * remainingSpace;
          if (isHorizontal) {
            childRect.width += extraSpace;
          } else {
            childRect.height += extraSpace;
          }
        }
      }
      remainingSpace = 0;
    } else if (remainingSpace < 0 && totalFlexShrink > 0) {
      // 空间不足，根据flex-shrink收缩
      for (const child of children) {
        const childStyle = child.getStyle();
        const childRect = child.getRect();
        const flexShrink = childStyle.flexShrink || 1;
        
        if (flexShrink > 0) {
          const shrinkSpace = (flexShrink / totalFlexShrink) * -remainingSpace;
          if (isHorizontal) {
            childRect.width = Math.max(0, childRect.width - shrinkSpace);
          } else {
            childRect.height = Math.max(0, childRect.height - shrinkSpace);
          }
        }
      }
      remainingSpace = 0;
    }
    
    // 根据justifyContent确定主轴上的位置
    let mainAxisOffset = 0;
    if (justifyContent === JustifyContent.FLEX_END) {
      mainAxisOffset = remainingSpace;
    } else if (justifyContent === JustifyContent.CENTER) {
      mainAxisOffset = remainingSpace / 2;
    } else if (justifyContent === JustifyContent.SPACE_BETWEEN && children.length > 1) {
      // 两端对齐，项目之间的间隔相等
      mainAxisOffset = 0;
      remainingSpace = remainingSpace / (children.length - 1);
    } else if (justifyContent === JustifyContent.SPACE_AROUND && children.length > 0) {
      // 项目两侧的间隔相等
      const spacePerItem = remainingSpace / children.length;
      mainAxisOffset = spacePerItem / 2;
      remainingSpace = spacePerItem;
    } else if (justifyContent === JustifyContent.SPACE_EVENLY && children.length > 0) {
      // 项目之间及项目与边框之间的间隔相等
      const spacePerGap = remainingSpace / (children.length + 1);
      mainAxisOffset = spacePerGap;
      remainingSpace = spacePerGap;
    }
    
    // 是否需要反转方向
    const isReverse = flexDirection === FlexDirection.ROW_REVERSE || flexDirection === FlexDirection.COLUMN_REVERSE;
    
    // 设置每个Flex项目的位置
    let currentMainAxisOffset = mainAxisOffset;
    for (let i = 0; i < children.length; i++) {
      const childIndex = isReverse ? children.length - 1 - i : i;
      const child = children[childIndex];
      const childRect = child.getRect();
      
      // 设置主轴位置
      if (isHorizontal) {
        childRect.x = rect.x + paddingLeft + currentMainAxisOffset;
      } else {
        childRect.y = rect.y + paddingTop + currentMainAxisOffset;
      }
      
      // 设置交叉轴位置
      this.alignFlexItem(child, container, isHorizontal, alignItems);
      
      // 更新主轴偏移量
      if (justifyContent === JustifyContent.SPACE_BETWEEN || 
          justifyContent === JustifyContent.SPACE_AROUND || 
          justifyContent === JustifyContent.SPACE_EVENLY) {
        currentMainAxisOffset += (isHorizontal ? childRect.width : childRect.height) + remainingSpace;
      } else {
        currentMainAxisOffset += isHorizontal ? childRect.width : childRect.height;
      }
    }
  }
  
  /**
   * 布局换行的Flex项目
   */
  private layoutFlexItemsWrap(
    container: LayoutNode,
    mainAxisSize: number,
    crossAxisSize: number,
    isHorizontal: boolean,
    flexDirection: FlexDirection,
    justifyContent: JustifyContent,
    alignItems: AlignItems,
    flexWrap: FlexWrap
  ): void {
    const style = container.getStyle();
    const rect = container.getRect();
    const children = container.getChildren();
    
    // 应用内边距
    const paddingLeft = style.paddingLeft || 0;
    const paddingTop = style.paddingTop || 0;
    
    // 是否需要反转方向
    const isMainAxisReverse = flexDirection === FlexDirection.ROW_REVERSE || flexDirection === FlexDirection.COLUMN_REVERSE;
    const isCrossAxisReverse = flexWrap === FlexWrap.WRAP_REVERSE;
    
    // 将项目分成多行
    const lines: LayoutNode[][] = [];
    let currentLine: LayoutNode[] = [];
    let currentLineMainAxisSize = 0;
    
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const childRect = child.getRect();
      const childMainAxisSize = isHorizontal ? childRect.width : childRect.height;
      
      // 检查是否需要换行
      if (currentLineMainAxisSize + childMainAxisSize > mainAxisSize && currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = [child];
        currentLineMainAxisSize = childMainAxisSize;
      } else {
        currentLine.push(child);
        currentLineMainAxisSize += childMainAxisSize;
      }
    }
    
    // 添加最后一行
    if (currentLine.length > 0) {
      lines.push(currentLine);
    }
    
    // 计算每行的主轴尺寸和交叉轴尺寸
    const lineMainAxisSizes: number[] = [];
    const lineCrossAxisSizes: number[] = [];
    
    for (const line of lines) {
      let lineMainAxisSize = 0;
      let lineCrossAxisSize = 0;
      
      for (const child of line) {
        const childRect = child.getRect();
        lineMainAxisSize += isHorizontal ? childRect.width : childRect.height;
        lineCrossAxisSize = Math.max(lineCrossAxisSize, isHorizontal ? childRect.height : childRect.width);
      }
      
      lineMainAxisSizes.push(lineMainAxisSize);
      lineCrossAxisSizes.push(lineCrossAxisSize);
    }
    
    // 计算总交叉轴尺寸
    const totalCrossAxisSize = lineCrossAxisSizes.reduce((sum, size) => sum + size, 0);
    
    // 计算交叉轴上的起始位置
    let crossAxisOffset = 0;
    if (alignItems === AlignItems.CENTER) {
      crossAxisOffset = (crossAxisSize - totalCrossAxisSize) / 2;
    } else if (alignItems === AlignItems.FLEX_END) {
      crossAxisOffset = crossAxisSize - totalCrossAxisSize;
    }
    
    // 如果是交叉轴反转，调整起始位置
    if (isCrossAxisReverse) {
      crossAxisOffset = crossAxisSize - totalCrossAxisSize - crossAxisOffset;
    }
    
    // 布局每一行
    let currentCrossAxisOffset = crossAxisOffset;
    
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const actualLineIndex = isCrossAxisReverse ? lines.length - 1 - lineIndex : lineIndex;
      const line = lines[actualLineIndex];
      const lineMainAxisSize = lineMainAxisSizes[actualLineIndex];
      const lineCrossAxisSize = lineCrossAxisSizes[actualLineIndex];
      
      // 计算主轴上的剩余空间
      const remainingMainAxisSpace = mainAxisSize - lineMainAxisSize;
      
      // 根据justifyContent确定主轴上的位置
      let lineMainAxisOffset = 0;
      if (justifyContent === JustifyContent.FLEX_END) {
        lineMainAxisOffset = remainingMainAxisSpace;
      } else if (justifyContent === JustifyContent.CENTER) {
        lineMainAxisOffset = remainingMainAxisSpace / 2;
      } else if (justifyContent === JustifyContent.SPACE_BETWEEN && line.length > 1) {
        lineMainAxisOffset = 0;
        // 两端对齐，项目之间的间隔相等
        remainingMainAxisSpace / (line.length - 1);
      } else if (justifyContent === JustifyContent.SPACE_AROUND && line.length > 0) {
        // 项目两侧的间隔相等
        const spacePerItem = remainingMainAxisSpace / line.length;
        lineMainAxisOffset = spacePerItem / 2;
      } else if (justifyContent === JustifyContent.SPACE_EVENLY && line.length > 0) {
        // 项目之间及项目与边框之间的间隔相等
        lineMainAxisOffset = remainingMainAxisSpace / (line.length + 1);
      }
      
      // 设置每个项目的位置
      let currentItemMainAxisOffset = lineMainAxisOffset;
      
      for (let itemIndex = 0; itemIndex < line.length; itemIndex++) {
        const actualItemIndex = isMainAxisReverse ? line.length - 1 - itemIndex : itemIndex;
        const child = line[actualItemIndex];
        const childRect = child.getRect();
        const childMainAxisSize = isHorizontal ? childRect.width : childRect.height;
        const childCrossAxisSize = isHorizontal ? childRect.height : childRect.width;
        
        // 设置主轴位置
        if (isHorizontal) {
          childRect.x = rect.x + paddingLeft + currentItemMainAxisOffset;
        } else {
          childRect.y = rect.y + paddingTop + currentItemMainAxisOffset;
        }
        
        // 设置交叉轴位置
        if (isHorizontal) {
          childRect.y = rect.y + paddingTop + currentCrossAxisOffset;
          
          // 根据alignItems调整单个项目在交叉轴上的位置
          if (alignItems === AlignItems.STRETCH) {
            childRect.height = lineCrossAxisSize;
          } else if (alignItems === AlignItems.CENTER) {
            childRect.y += (lineCrossAxisSize - childCrossAxisSize) / 2;
          } else if (alignItems === AlignItems.FLEX_END) {
            childRect.y += lineCrossAxisSize - childCrossAxisSize;
          }
        } else {
          childRect.x = rect.x + paddingLeft + currentCrossAxisOffset;
          
          // 根据alignItems调整单个项目在交叉轴上的位置
          if (alignItems === AlignItems.STRETCH) {
            childRect.width = lineCrossAxisSize;
          } else if (alignItems === AlignItems.CENTER) {
            childRect.x += (lineCrossAxisSize - childCrossAxisSize) / 2;
          } else if (alignItems === AlignItems.FLEX_END) {
            childRect.x += lineCrossAxisSize - childCrossAxisSize;
          }
        }
        
        // 更新主轴偏移量
        currentItemMainAxisOffset += childMainAxisSize;
        
        // 如果是space-between、space-around或space-evenly，添加间隔
        if (justifyContent === JustifyContent.SPACE_BETWEEN && line.length > 1 && actualItemIndex < line.length - 1) {
          currentItemMainAxisOffset += remainingMainAxisSpace / (line.length - 1);
        } else if (justifyContent === JustifyContent.SPACE_AROUND && actualItemIndex < line.length - 1) {
          currentItemMainAxisOffset += remainingMainAxisSpace / line.length;
        } else if (justifyContent === JustifyContent.SPACE_EVENLY && actualItemIndex < line.length - 1) {
          currentItemMainAxisOffset += remainingMainAxisSpace / (line.length + 1);
        }
      }
      
      // 更新交叉轴偏移量
      currentCrossAxisOffset += lineCrossAxisSize;
    }
  }
  
  /**
   * 对齐单个Flex项目在交叉轴上的位置
   */
  private alignFlexItem(
    item: LayoutNode,
    container: LayoutNode,
    isHorizontal: boolean,
    alignItems: AlignItems
  ): void {
    const containerRect = container.getRect();
    const containerStyle = container.getStyle();
    const itemRect = item.getRect();
    
    // 应用内边距
    const paddingTop = containerStyle.paddingTop || 0;
    const paddingLeft = containerStyle.paddingLeft || 0;
    
    if (isHorizontal) {
      // 水平方向的Flex容器，交叉轴是垂直方向
      const containerCrossAxisSize = containerRect.height - (containerStyle.paddingTop || 0) - (containerStyle.paddingBottom || 0);
      const itemCrossAxisSize = itemRect.height;
      
      if (alignItems === AlignItems.STRETCH) {
        // 拉伸填满交叉轴
        itemRect.height = containerCrossAxisSize;
        itemRect.y = containerRect.y + paddingTop;
      } else if (alignItems === AlignItems.CENTER) {
        // 居中对齐
        itemRect.y = containerRect.y + paddingTop + (containerCrossAxisSize - itemCrossAxisSize) / 2;
      } else if (alignItems === AlignItems.FLEX_END) {
        // 交叉轴终点对齐
        itemRect.y = containerRect.y + paddingTop + containerCrossAxisSize - itemCrossAxisSize;
      } else {
        // 默认为flex-start，交叉轴起点对齐
        itemRect.y = containerRect.y + paddingTop;
      }
    } else {
      // 垂直方向的Flex容器，交叉轴是水平方向
      const containerCrossAxisSize = containerRect.width - (containerStyle.paddingLeft || 0) - (containerStyle.paddingRight || 0);
      const itemCrossAxisSize = itemRect.width;
      
      if (alignItems === AlignItems.STRETCH) {
        // 拉伸填满交叉轴
        itemRect.width = containerCrossAxisSize;
        itemRect.x = containerRect.x + paddingLeft;
      } else if (alignItems === AlignItems.CENTER) {
        // 居中对齐
        itemRect.x = containerRect.x + paddingLeft + (containerCrossAxisSize - itemCrossAxisSize) / 2;
      } else if (alignItems === AlignItems.FLEX_END) {
        // 交叉轴终点对齐
        itemRect.x = containerRect.x + paddingLeft + containerCrossAxisSize - itemCrossAxisSize;
      } else {
        // 默认为flex-start，交叉轴起点对齐
        itemRect.x = containerRect.x + paddingLeft;
      }
    }
  }
}