import { LayoutContext } from '../core/LayoutContext';
import { LayoutNode } from '../core/LayoutNode';
/**
 * Flex布局算法
 * 实现类似CSS Flexbox的布局算法
 */
export declare class FlexLayout {
    /**
     * 执行Flex布局
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
     * 对Flex容器进行布局
     * @param container Flex容器节点
     * @param context 布局上下文
     */
    private layoutFlexContainer;
    /**
     * 布局不换行的Flex项目
     */
    private layoutFlexItemsNoWrap;
    /**
     * 布局换行的Flex项目
     */
    private layoutFlexItemsWrap;
    /**
     * 对齐单个Flex项目在交叉轴上的位置
     */
    private alignFlexItem;
}
