import { LayoutNode } from '../core/LayoutNode';
/**
 * Canvas渲染器
 * 将布局结果渲染到Canvas上
 */
export declare class CanvasRenderer {
    private canvas;
    private ctx;
    private devicePixelRatio;
    /**
     * 创建Canvas渲染器
     * @param canvas HTML Canvas元素或OffscreenCanvas
     * @param devicePixelRatio 设备像素比
     */
    constructor(canvas: HTMLCanvasElement | OffscreenCanvas, devicePixelRatio?: number);
    /**
     * 更新Canvas尺寸
     */
    private updateCanvasSize;
    /**
     * 清除Canvas
     */
    clear(): void;
    /**
     * 渲染布局树
     * @param rootNode 布局树的根节点
     */
    render(rootNode: LayoutNode): void;
    /**
     * 渲染单个节点及其子节点
     * @param node 要渲染的节点
     */
    private renderNode;
    /**
     * 渲染文本节点
     * @param node 文本节点
     */
    private renderText;
    /**
     * 渲染图像节点
     * @param node 图像节点
     */
    private renderImage;
    /**
     * 获取Canvas元素
     */
    getCanvas(): HTMLCanvasElement | OffscreenCanvas;
    /**
     * 获取Canvas上下文
     */
    getContext(): CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
}
