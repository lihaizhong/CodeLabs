/**
 * Octopus Layout 使用示例
 * 展示如何使用基于 CSS 属性的 Canvas 布局系统
 */
import CanvasLayoutEngine, { LayoutNode } from './index';
/**
 * 创建示例布局
 */
export declare function createExampleLayout(): LayoutNode;
/**
 * 初始化示例
 */
export declare function initExample(canvas: HTMLCanvasElement): CanvasLayoutEngine;
/**
 * 创建响应式布局示例
 */
export declare function createResponsiveExample(width: number): LayoutNode;
declare const _default: {
    createExampleLayout: typeof createExampleLayout;
    initExample: typeof initExample;
    createResponsiveExample: typeof createResponsiveExample;
};
export default _default;
