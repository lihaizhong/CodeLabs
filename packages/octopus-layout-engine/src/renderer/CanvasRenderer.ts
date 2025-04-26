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

import { LayoutNode } from '../core/LayoutNode';
import { NodeType } from '../types';

/**
 * Canvas渲染器
 * 将布局结果渲染到Canvas上
 */
export class CanvasRenderer {
  private canvas: HTMLCanvasElement | OffscreenCanvas;
  private ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  private devicePixelRatio: number;
  
  /**
   * 创建Canvas渲染器
   * @param canvas HTML Canvas元素或OffscreenCanvas
   * @param devicePixelRatio 设备像素比
   */
  constructor(canvas: HTMLCanvasElement | OffscreenCanvas, devicePixelRatio: number = 1) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
    this.devicePixelRatio = devicePixelRatio;
    
    // 设置Canvas尺寸，考虑设备像素比
    this.updateCanvasSize();
  }
  
  /**
   * 更新Canvas尺寸
   */
  private updateCanvasSize(): void {
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    // 设置Canvas的实际尺寸，考虑设备像素比
    if (this.canvas instanceof HTMLCanvasElement) {
      this.canvas.width = width * this.devicePixelRatio;
      this.canvas.height = height * this.devicePixelRatio;
      this.canvas.style.width = `${width}px`;
      this.canvas.style.height = `${height}px`;
    } else {
      this.canvas.width = width * this.devicePixelRatio;
      this.canvas.height = height * this.devicePixelRatio;
    }
    
    // 缩放上下文以匹配设备像素比
    this.ctx.scale(this.devicePixelRatio, this.devicePixelRatio);
  }
  
  /**
   * 清除Canvas
   */
  clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width / this.devicePixelRatio, this.canvas.height / this.devicePixelRatio);
  }
  
  /**
   * 渲染布局树
   * @param rootNode 布局树的根节点
   */
  render(rootNode: LayoutNode): void {
    this.clear();
    this.renderNode(rootNode);
  }
  
  /**
   * 渲染单个节点及其子节点
   * @param node 要渲染的节点
   */
  private renderNode(node: LayoutNode): void {
    const rect = node.getRect();
    const style = node.getStyle();
    
    // 渲染背景
    if (style.backgroundColor) {
      this.ctx.fillStyle = style.backgroundColor;
      this.ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    }
    
    // 根据节点类型进行不同的渲染
    if (node.getType() === NodeType.TEXT) {
      this.renderText(node);
    } else if (node.getType() === NodeType.IMAGE) {
      this.renderImage(node);
    }
    
    // 递归渲染子节点
    for (const child of node.getChildren()) {
      this.renderNode(child);
    }
  }
  
  /**
   * 渲染文本节点
   * @param node 文本节点
   */
  private renderText(node: LayoutNode): void {
    const rect = node.getRect();
    const style = node.getStyle();
    const textMetrics = node.getTextMetrics();
    
    if (!textMetrics) {
      return;
    }
    
    const fontSize = style.fontSize || 16;
    const lineHeight = style.lineHeight || fontSize * 1.2;
    const color = style.color || '#000000';
    
    this.ctx.font = `${fontSize}px sans-serif`;
    this.ctx.fillStyle = color;
    this.ctx.textBaseline = 'top';
    
    // 根据文本对齐方式设置textAlign
    if (style.textAlign) {
      this.ctx.textAlign = style.textAlign as CanvasTextAlign;
    } else {
      this.ctx.textAlign = 'left';
    }
    
    // 渲染每一行文本
    const lines = textMetrics.lines;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const y = rect.y + i * lineHeight;
      
      // 根据textAlign确定x坐标
      let x = rect.x;
      if (this.ctx.textAlign === 'center') {
        x = rect.x + rect.width / 2;
      } else if (this.ctx.textAlign === 'right') {
        x = rect.x + rect.width;
      }
      
      this.ctx.fillText(line, x, y);
    }
  }
  
  /**
   * 渲染图像节点
   * @param node 图像节点
   */
  private renderImage(node: LayoutNode): void {
    const rect = node.getRect();
    const content = node.getContent();
    
    if (!content) {
      return;
    }
    
    // 假设content是图像URL或数据URL
    const image = new Image();
    image.src = content;
    
    // 图像加载完成后渲染
    image.onload = () => {
      this.ctx.drawImage(image, rect.x, rect.y, rect.width, rect.height);
    };
  }
  
  /**
   * 获取Canvas元素
   */
  getCanvas(): HTMLCanvasElement | OffscreenCanvas {
    return this.canvas;
  }
  
  /**
   * 获取Canvas上下文
   */
  getContext(): CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D {
    return this.ctx;
  }
}