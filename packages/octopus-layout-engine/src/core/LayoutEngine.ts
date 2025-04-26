// Copyright 2025 LiHZSky
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     https://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { LayoutContext, LayoutContextImpl } from './LayoutContext';
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
  private context: LayoutContext;
  private flowLayout: FlowLayout;
  private flexLayout: FlexLayout;
  private renderer: CanvasRenderer | null;
  
  /**
   * 创建布局引擎
   * @param options 布局上下文配置
   */
  constructor(options: LayoutContextOptions) {
    this.context = new LayoutContextImpl(options);
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
   * 使用流式布局算法布局节点
   * @param rootNode 根节点
   */
  layoutWithFlow(rootNode: LayoutNode): void {
    this.flowLayout.layout(rootNode, this.context);
  }
  
  /**
   * 使用Flex布局算法布局节点
   * @param rootNode 根节点
   */
  layoutWithFlex(rootNode: LayoutNode): void {
    this.flexLayout.layout(rootNode, this.context);
  }
  
  /**
   * 渲染布局树
   * @param rootNode 根节点
   */
  render(rootNode: LayoutNode): void {
    if (this.renderer) {
      this.renderer.render(rootNode);
    } else {
      console.warn('No renderer set. Call setRenderer() before rendering.');
    }
  }
  
  /**
   * 一次性完成布局和渲染
   * @param rootNode 根节点
   * @param useFlexLayout 是否使用Flex布局，默认为false（使用流式布局）
   */
  layoutAndRender(rootNode: LayoutNode, useFlexLayout: boolean = false): void {
    if (useFlexLayout) {
      this.layoutWithFlex(rootNode);
    } else {
      this.layoutWithFlow(rootNode);
    }
    
    this.render(rootNode);
  }
}