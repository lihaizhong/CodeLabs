import { LayoutContext } from './LayoutContext';
import { LayoutNode } from './LayoutNode';
import { LayoutRenderer } from './LayoutRenderer';

/**
 * 布局引擎主类
 * 整合布局上下文、布局算法和渲染器
 */
export class LayoutEngine {
  private readonly context: LayoutContext;
  private readonly renderer: LayoutRenderer | null;
  
  /**
   * 创建布局引擎
   * @param options 布局上下文配置
   */
  constructor(context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) {
    this.renderer = new LayoutRenderer(context);
    this.context = new LayoutContext(context);
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
  createLayoutTree(options: OctopusLayout.LayoutNodeOptions): LayoutNode {
    return new LayoutNode(options);
  }

  /**
   * 计算布局
   * @param rootNode 根节点
   */
  layout(rootNode: LayoutNode): void {
    this.context.calculateLayout(rootNode);
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
   */
  layoutAndRender(rootNode: LayoutNode): void {
    this.layout(rootNode);
    this.render(rootNode);
  }
}