import { LayoutContext } from './LayoutContext';
import { LayoutNode } from './LayoutNode';
import { CanvasRenderer } from '../renderer/CanvasRenderer';
import { LayoutContextOptions, LayoutNodeOptions } from '../types';
/**
 * 布局引擎主类
 * 整合布局上下文、布局算法和渲染器
 */
export declare class LayoutEngine {
    private readonly context;
    private readonly flowLayout;
    private readonly flexLayout;
    private renderer;
    /**
     * 创建布局引擎
     * @param options 布局上下文配置
     */
    constructor(options: LayoutContextOptions);
    /**
     * 设置渲染器
     * @param renderer Canvas渲染器
     */
    setRenderer(renderer: CanvasRenderer): void;
    /**
     * 获取布局上下文
     */
    getContext(): LayoutContext;
    /**
     * 创建布局树
     * @param options 布局节点配置
     */
    createLayoutTree(options: LayoutNodeOptions): LayoutNode;
    /**
     * 渲染布局树
     * @param rootNode 根节点
     */
    render(rootNode: LayoutNode): void;
    /**
     * 一次性完成布局和渲染
     * @param rootNode 根节点
     * @param useFlexLayout 是否使用Flex布局，默认为false（使用流式布局）
     */
    layoutAndRender(rootNode: LayoutNode, useFlexLayout?: boolean): void;
}
