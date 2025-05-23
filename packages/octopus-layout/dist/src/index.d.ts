/**
 * Octopus Layout - Canvas 2D 布局引擎
 * 基于 CSS 属性的文字布局系统
 */
export interface TextStyle {
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string | number;
    color?: string;
    lineHeight?: number;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    textDecoration?: 'none' | 'underline' | 'line-through';
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
        style?: 'solid' | 'dashed' | 'dotted';
    };
}
export interface LayoutNode {
    id?: string;
    type: 'text' | 'container';
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
    defaultFontSize?: number;
    defaultFontFamily?: string;
    defaultLineHeight?: number;
}
export declare class CanvasLayoutEngine {
    private ctx;
    private options;
    constructor(canvas: HTMLCanvasElement, options: LayoutOptions);
    /**
     * 计算文本尺寸
     */
    private measureText;
    /**
     * 计算盒模型尺寸
     */
    private calculateBoxSize;
    /**
     * 布局计算
     */
    private layout;
    /**
     * 渲染文本
     */
    private renderText;
    /**
     * 渲染边框和背景
     */
    private renderBox;
    /**
     * 渲染节点
     */
    private renderNode;
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
export declare function createTextNode(content: string, style?: TextStyle, box?: BoxModel): LayoutNode;
/**
 * 创建容器节点的辅助函数
 */
export declare function createContainerNode(children: LayoutNode[], box?: BoxModel): LayoutNode;
export default CanvasLayoutEngine;
