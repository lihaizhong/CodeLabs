import { LayoutContext } from './LayoutContext';
import { LayoutNode } from './LayoutNode';
import { LayoutRenderer } from './LayoutRenderer';
import { LayoutCalculator } from './LayoutCalculator';
import { LayoutNodeOptions } from '../types';

/**
 * 布局引擎主类
 * 整合布局上下文、布局算法和渲染器
 */
export class LayoutEngine {
  private readonly context: LayoutContext;
  private readonly renderer: LayoutRenderer | null;
  private readonly calculator: LayoutCalculator;
  
  /**
   * 创建布局引擎
   * @param options 布局上下文配置
   */
  constructor(canvas: HTMLCanvasElement | OffscreenCanvas) {
    const context = canvas.getContext('2d')!;
    this.renderer = new LayoutRenderer(context);
    this.context = new LayoutContext(context);
    this.calculator = new LayoutCalculator(this.context);
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
   * 计算布局
   * @param rootNode 根节点
   */
  layout(rootNode: LayoutNode): void {
    this.calculator.calculateLayout(rootNode);
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