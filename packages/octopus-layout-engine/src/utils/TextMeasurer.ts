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

import { TextMetrics } from '../types';

/**
 * 文本测量工具类
 * 提供精确的文本尺寸测量和断行功能
 */
export class TextMeasurer {
  private canvas: OffscreenCanvas;
  private ctx: OffscreenCanvasRenderingContext2D;
  
  constructor() {
    // 创建离屏Canvas用于文本测量
    this.canvas = new OffscreenCanvas(1, 1);
    this.ctx = this.canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
  }
  
  /**
   * 测量文本尺寸
   * @param text 要测量的文本
   * @param fontSize 字体大小
   * @param fontFamily 字体族
   * @param maxWidth 最大宽度，用于计算换行
   * @param lineHeight 行高
   */
  measureText(text: string, fontSize: number, fontFamily: string = 'sans-serif', maxWidth?: number, lineHeight?: number): TextMetrics {
    if (!text) {
      return { width: 0, height: 0, lines: [] };
    }

    const actualLineHeight = lineHeight || fontSize * 1.2;
    this.ctx.font = `${fontSize}px ${fontFamily}`;
    
    // 如果没有最大宽度限制或文本宽度小于最大宽度，不需要换行
    const metrics = this.ctx.measureText(text);
    if (!maxWidth || metrics.width <= maxWidth) {
      return {
        width: metrics.width,
        height: actualLineHeight,
        lines: [text]
      };
    }

    // 需要换行处理
    return this.breakTextIntoLines(text, fontSize, fontFamily, maxWidth, actualLineHeight);
  }

  /**
   * 将文本按照最大宽度断行
   */
  private breakTextIntoLines(text: string, fontSize: number, fontFamily: string, maxWidth: number, lineHeight: number): TextMetrics {
    this.ctx.font = `${fontSize}px ${fontFamily}`;
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
      height: lines.length * lineHeight,
      lines
    };
  }

  /**
   * 测量中文文本，按字符分割
   * 针对中文等不使用空格分词的语言
   */
  measureCJKText(text: string, fontSize: number, fontFamily: string = 'sans-serif', maxWidth?: number, lineHeight?: number): TextMetrics {
    if (!text) {
      return { width: 0, height: 0, lines: [] };
    }

    const actualLineHeight = lineHeight || fontSize * 1.2;
    this.ctx.font = `${fontSize}px ${fontFamily}`;
    
    // 如果没有最大宽度限制或文本宽度小于最大宽度，不需要换行
    const metrics = this.ctx.measureText(text);
    if (!maxWidth || metrics.width <= maxWidth) {
      return {
        width: metrics.width,
        height: actualLineHeight,
        lines: [text]
      };
    }

    // 需要换行处理，按字符分割
    return this.breakCJKTextIntoLines(text, fontSize, fontFamily, maxWidth, actualLineHeight);
  }

  /**
   * 将中文文本按照最大宽度断行，按字符分割
   */
  private breakCJKTextIntoLines(text: string, fontSize: number, fontFamily: string, maxWidth: number, lineHeight: number): TextMetrics {
    this.ctx.font = `${fontSize}px ${fontFamily}`;
    const chars = Array.from(text); // 将文本拆分为字符数组
    const lines: string[] = [];
    let currentLine = '';
    let maxLineWidth = 0;

    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      const testLine = currentLine + char;
      const metrics = this.ctx.measureText(testLine);
      
      if (metrics.width <= maxWidth || !currentLine) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        maxLineWidth = Math.max(maxLineWidth, this.ctx.measureText(currentLine).width);
        currentLine = char;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
      maxLineWidth = Math.max(maxLineWidth, this.ctx.measureText(currentLine).width);
    }

    return {
      width: maxLineWidth,
      height: lines.length * lineHeight,
      lines
    };
  }
}