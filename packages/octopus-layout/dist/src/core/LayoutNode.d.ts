import { LayoutContext } from "./LayoutContext";
import { LayoutNodeOptions, NodeRect, NodeStyle, NodeType, TextMetrics } from "../types";
/**
 * 布局节点类
 * 表示布局树中的一个节点，可以是容器、文本或图像
 */
export declare class LayoutNode {
    /**
     * 节点类型
     */
    readonly type: NodeType;
    /**
     * 节点内容
     */
    readonly content: string;
    /**
     * 节点样式
     */
    readonly style: NodeStyle;
    /**
     * 子节点
     */
    readonly children: LayoutNode[];
    /**
     * 父节点
     */
    readonly parent: LayoutNode | null;
    /**
     * 节点位置和尺寸
     */
    readonly rect: NodeRect;
    /**
     * 文本测量结果
     */
    private textMetrics;
    constructor(options: LayoutNodeOptions, parent?: LayoutNode | null);
    /**
     * 获取节点的绝对位置
     */
    setPosition(x: number, y: number): void;
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
