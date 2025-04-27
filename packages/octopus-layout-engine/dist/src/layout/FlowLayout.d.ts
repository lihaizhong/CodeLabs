import { LayoutContext } from '../core/LayoutContext';
import { LayoutNode } from '../core/LayoutNode';
/**
 * 流式布局算法
 * 实现类似HTML中的流式布局，元素从左到右、从上到下排列
 */
export declare class FlowLayout {
    /**
     * 执行流式布局
     * @param rootNode 根节点
     * @param context 布局上下文
     */
    layout(rootNode: LayoutNode, context: LayoutContext): void;
    /**
     * 对单个节点及其子节点进行布局
     * @param node 当前节点
     * @param x 起始X坐标
     * @param y 起始Y坐标
     * @param context 布局上下文
     */
    private layoutNode;
    /**
     * 处理文本水平对齐
     * @param node 容器节点
     * @param align 对齐方式
     */
    private alignChildrenInLine;
    /**
     * 处理垂直对齐
     * @param node 容器节点
     * @param align 对齐方式
     */
    private alignChildrenVertically;
}
