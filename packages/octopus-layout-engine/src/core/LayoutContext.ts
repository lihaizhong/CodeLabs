import { TextMetrics } from "../types";

/**
 * 布局上下文实现类
 * 提供布局计算所需的环境和工具方法
 */
export class LayoutContext {
  constructor(
    private readonly context:
      | CanvasRenderingContext2D
      | OffscreenCanvasRenderingContext2D
  ) {}

  /**
   * 测量文本尺寸
   * @param text 要测量的文本
   * @param fontSize 字体大小
   * @param fontFamily 字体族
   * @param maxWidth 最大宽度，用于计算换行
   * @param lineHeight 行高
   */
  measureText(
    text: string,
    fontSize: number,
    fontFamily: string = "sans-serif",
    maxWidth?: number,
    lineHeight?: number
  ): TextMetrics {
    if (!text) {
      return { width: 0, height: 0, lines: [] };
    }

    const actualLineHeight = lineHeight || fontSize * 1.2;
    this.context.font = `${fontSize}px ${fontFamily}`;

    // 如果没有最大宽度限制或文本宽度小于最大宽度，不需要换行
    const metrics = this.context.measureText(text);
    if (!maxWidth || metrics.width <= maxWidth) {
      return {
        width: metrics.width,
        height: actualLineHeight,
        lines: [text],
      };
    }

    // 需要换行处理
    return this.breakTextIntoLines(
      text,
      fontSize,
      fontFamily,
      maxWidth,
      actualLineHeight
    );
  }

  /**
   * 将文本按照最大宽度断行
   */
  private breakTextIntoLines(
    text: string,
    fontSize: number,
    fontFamily: string,
    maxWidth: number,
    lineHeight: number
  ): TextMetrics {
    this.context.font = `${fontSize}px ${fontFamily}`;
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";
    let maxLineWidth = 0;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = this.context.measureText(testLine);

      if (metrics.width <= maxWidth || !currentLine) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        maxLineWidth = Math.max(
          maxLineWidth,
          this.context.measureText(currentLine).width
        );
        currentLine = word;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
      maxLineWidth = Math.max(
        maxLineWidth,
        this.context.measureText(currentLine).width
      );
    }

    return {
      width: maxLineWidth,
      height: lines.length * lineHeight,
      lines,
    };
  }

  /**
   * 测量中文文本，按字符分割
   * 针对中文等不使用空格分词的语言
   */
  measureCJKText(
    text: string,
    fontSize: number,
    fontFamily: string = "sans-serif",
    maxWidth?: number,
    lineHeight?: number
  ): TextMetrics {
    if (!text) {
      return { width: 0, height: 0, lines: [] };
    }

    const actualLineHeight = lineHeight || fontSize * 1.2;
    this.context.font = `${fontSize}px ${fontFamily}`;

    // 如果没有最大宽度限制或文本宽度小于最大宽度，不需要换行
    const metrics = this.context.measureText(text);
    if (!maxWidth || metrics.width <= maxWidth) {
      return {
        width: metrics.width,
        height: actualLineHeight,
        lines: [text],
      };
    }

    // 需要换行处理，按字符分割
    return this.breakCJKTextIntoLines(
      text,
      fontSize,
      fontFamily,
      maxWidth,
      actualLineHeight
    );
  }

  /**
   * 将中文文本按照最大宽度断行，按字符分割
   */
  private breakCJKTextIntoLines(
    text: string,
    fontSize: number,
    fontFamily: string,
    maxWidth: number,
    lineHeight: number
  ): TextMetrics {
    this.context.font = `${fontSize}px ${fontFamily}`;
    const chars = Array.from(text); // 将文本拆分为字符数组
    const lines: string[] = [];
    let currentLine = "";
    let maxLineWidth = 0;

    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      const testLine = currentLine + char;
      const metrics = this.context.measureText(testLine);

      if (metrics.width <= maxWidth || !currentLine) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        maxLineWidth = Math.max(
          maxLineWidth,
          this.context.measureText(currentLine).width
        );
        currentLine = char;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
      maxLineWidth = Math.max(
        maxLineWidth,
        this.context.measureText(currentLine).width
      );
    }

    return {
      width: maxLineWidth,
      height: lines.length * lineHeight,
      lines,
    };
  }
}
