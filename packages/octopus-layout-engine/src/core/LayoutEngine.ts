import { LayoutContext } from './LayoutContext';
import { LayoutNode } from './LayoutNode';
import { FlowLayout } from '../layout/FlowLayout';
import { FlexLayout } from '../layout/FlexLayout';
import { CanvasRenderer } from '../renderer/CanvasRenderer';
import { LayoutContextOptions, LayoutNodeOptions } from '../types';

/**
 * 布局引擎主类
 * 整合布局上下文、布局算法和渲染器
 */
export class LayoutEngine {
  private readonly context: LayoutContext;
  private readonly flowLayout: FlowLayout;
  private readonly flexLayout: FlexLayout;
  private renderer: CanvasRenderer | null;
  
  /**
   * 创建布局引擎
   * @param options 布局上下文配置
   */
  constructor(options: LayoutContextOptions) {
    this.context = new LayoutContext(options);
    this.flowLayout = new FlowLayout();
    this.flexLayout = new FlexLayout();
    this.renderer = null;
  }
  
  /**
   * 设置渲染器
   * @param renderer Canvas渲染器
   */
  setRenderer(renderer: CanvasRenderer): void {
    this.renderer = renderer;
  }
  
  /**
   * 获取布局上下文
   */
  getContext(): LayoutContext {
    return this.context;
  }
  
  /**
   * 创建布局树
   * @param options 布局节点配置
   */
  createLayoutTree(options: LayoutNodeOptions): LayoutNode {
    return new LayoutNode(options);
  }

  /**
   * 渲染布局树
   * @param rootNode 根节点
   */
  render(rootNode: LayoutNode): void {
    if (!this.renderer) {
      throw new Error('No renderer set. Call setRenderer() before rendering.');
    }

    this.renderer.render(rootNode);
  }
  
  /**
   * 一次性完成布局和渲染
   * @param rootNode 根节点
   * @param useFlexLayout 是否使用Flex布局，默认为false（使用流式布局）
   */
  layoutAndRender(rootNode: LayoutNode, useFlexLayout: boolean = false): void {
    if (useFlexLayout) {
      // 使用Flex布局算法布局节点
      this.flexLayout.layout(rootNode, this.context);
    } else {
      // 使用流式布局算法布局节点
      this.flowLayout.layout(rootNode, this.context);
    }
    
    this.render(rootNode);
  }
}