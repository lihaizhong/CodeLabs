/**
 * Octopus Layout - Canvas 2D 布局引擎类型定义
 */

declare namespace OctopusLayout {
  export interface TextStyle {
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string | number;
    fontStyle?: "normal" | "italic" | "oblique";
    color?: string;
    lineHeight?: number;
    textAlign?: "left" | "center" | "right" | "justify";
    textDecoration?: "none" | "underline" | "line-through";
    letterSpacing?: number;
    wordSpacing?: number;
  }
  
  export interface BoxModel {
    width?: number;
    height?: number;
    padding?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
    margin?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
    border?: {
      width?: number;
      color?: string;
      style?: "solid" | "dashed" | "dotted";
    };
  }
  
  export interface LayoutNode {
    id?: string;
    type: "text" | "container";
    content?: string;
    style?: TextStyle;
    box?: BoxModel;
    children?: LayoutNode[];
    x?: number;
    y?: number;
    computedWidth?: number;
    computedHeight?: number;
  }
  
  export interface LayoutOptions {
    containerWidth: number;
    containerHeight: number;
    defaultFontStyle: "normal" | "italic" | "oblique";
    defaultFontWeight: string | number;
    defaultFontSize?: number;
    defaultFontFamily?: string;
    defaultColor?: string;
    defaultLineHeight?: number;
  }
  
  export class CanvasLayoutEngine {
    constructor(canvas: HTMLCanvasElement, options: LayoutOptions);
    
    /**
     * 渲染布局树
     */
    render(layoutTree: LayoutNode): void;
    
    /**
     * 获取节点在指定位置的信息
     */
    getNodeAt(x: number, y: number, node: LayoutNode): LayoutNode | null;
  }
  
  /**
   * 创建文本节点的辅助函数
   */
  export function createTextNode(content: string, style?: TextStyle, box?: BoxModel): LayoutNode;
  
  /**
   * 创建容器节点的辅助函数
   */
  export function createContainerNode(children: LayoutNode[], box?: BoxModel): LayoutNode;    
}
