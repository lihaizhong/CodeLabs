import { LayoutContext } from './LayoutContext';
import { LayoutNodeOptions, NodeRect, NodeStyle, NodeType, TextMetrics } from '../types';
/**
 * 布局节点类
 * 表示布局树中的一个节点，可以是容器、文本或图像
 */
export declare class LayoutNode {
    private id;
    private type;
    private content;
    private style;
    private children;
    private parent;
    private rect;
    private textMetrics;
    constructor(options: LayoutNodeOptions);
    /**
     * 获取节点ID
     */
    getId(): string;
    /**
     * 获取节点类型
     */
    getType(): NodeType;
    /**
     * 获取节点内容
     */
    getContent(): string;
    /**
     * 获取节点样式
     */
    getStyle(): NodeStyle;
    /**
     * 获取子节点列表
     */
    getChildren(): LayoutNode[];
    /**
     * 获取父节点
     */
    getParent(): LayoutNode | null;
    /**
     * 设置父节点
     */
    setParent(parent: LayoutNode | null): void;
    /**
     * 添加子节点
     */
    appendChild(child: LayoutNode): void;
    /**
     * 获取节点位置和尺寸
     */
    getRect(): NodeRect;
    /**
     * 设置节点位置和尺寸
     */
    setRect(rect: NodeRect): void;
    /**
     * 获取文本测量结果
     */
    getTextMetrics(): TextMetrics | null;
    /**
     * 设置文本测量结果
     */
    setTextMetrics(metrics: TextMetrics): void;
    /**
     * 测量节点尺寸
     * @param context 布局上下文
     */
    measure(context: LayoutContext): void;
}
