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

import { LayoutContextOptions, NodeRect, TextMetrics } from '../types';

/**
 * 布局上下文接口
 * 提供布局计算所需的环境和工具方法
 */
export interface LayoutContext {
  /**
   * 获取布局上下文的宽度
   */
  getWidth(): number;

  /**
   * 获取布局上下文的高度
   */
  getHeight(): number;

  /**
   * 获取设备像素比
   */
  getDevicePixelRatio(): number;

  /**
   * 测量文本尺寸和断行
   * @param text 要测量的文本
   * @param fontSize 字体大小
   * @param maxWidth 最大宽度，用于计算换行
   * @param lineHeight 行高
   */
  measureText(text: string, fontSize: number, maxWidth: number, lineHeight: number): TextMetrics;
}

/**
 * 布局上下文实现类
 */
export class LayoutContextImpl implements LayoutContext {
  private width: number;
  private height: number;
  private devicePixelRatio: number;
  private canvas: OffscreenCanvas;
  private ctx: OffscreenCanvasRenderingContext2D;

  constructor(options: LayoutContextOptions) {
    this.width = options.width;
    this.height = options.height;
    this.devicePixelRatio = options.devicePixelRatio || 1;
    
    // 创建离屏Canvas用于文本测量
    this.canvas = new OffscreenCanvas(1, 1);
    this.ctx = this.canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }

  getDevicePixelRatio(): number {
    return this.devicePixelRatio;
  }

  measureText(text: string, fontSize: number, maxWidth: number, lineHeight: number): TextMetrics {
    if (!text) {
      return { width: 0, height: 0, lines: [] };
    }

    this.ctx.font = `${fontSize}px sans-serif`;
    
    // 如果没有最大宽度限制或文本宽度小于最大宽度，不需要换行
    const metrics = this.ctx.measureText(text);
    if (!maxWidth || metrics.width <= maxWidth) {
      return {
        width: metrics.width,
        height: lineHeight || fontSize * 1.2,
        lines: [text]
      };
    }

    // 需要换行处理
    return this.breakTextIntoLines(text, fontSize, maxWidth, lineHeight);
  }

  /**
   * 将文本按照最大宽度断行
   */
  private breakTextIntoLines(text: string, fontSize: number, maxWidth: number, lineHeight: number): TextMetrics {
    const actualLineHeight = lineHeight || fontSize * 1.2;
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    let maxLineWidth = 0;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = this.ctx.measureText(testLine);
      
      if (metrics.width <= maxWidth || !currentLine) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        maxLineWidth = Math.max(maxLineWidth, this.ctx.measureText(currentLine).width);
        currentLine = word;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
      maxLineWidth = Math.max(maxLineWidth, this.ctx.measureText(currentLine).width);
    }

    return {
      width: maxLineWidth,
      height: lines.length * actualLineHeight,
      lines
    };
  }
}