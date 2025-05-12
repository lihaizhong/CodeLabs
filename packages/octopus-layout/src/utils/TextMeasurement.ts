export class TextMeasurement {
  private word: string = "";

  private maxLineWidth: number = 0;

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
    font: string,
    maxWidth: number,
    lineHeight: number
  ): OctopusLayout.TextMetrics {
    if (!text) {
      return {
        width: 0,
        height: 0,
        lines: [],
      };
    }

    const { context } = this;

    context.font = font;

    const metrics = context.measureText(text);
    // 如果没有最大宽度限制或文本宽度小于最大宽度，不需要换行
    if (maxWidth <= 0 || metrics.width <= maxWidth) {
      return {
        width: metrics.width,
        height: lineHeight,
        lines: [text],
      };
    }

    return this.breakTextIntoLines(text, maxWidth, lineHeight);
  }

  /**
   * 检查单词是否需要截断（目前仅支持英文）
   * @param char 
   * @returns 
   */
  private needBreak(char: string): boolean {
    return !/[a-zA-Z]/.test(char);
  }

  /**
   * 追加字母到单词
   * @param char 
   */
  private appendChar(char: string): void {
    // 如果是字母，添加到当前单词
    if (this.needBreak(char) && this.word.length > 0) {
      this.word = "";
    } else {
      this.word += char;
    }
  }

  /**
   * 截取文本中的单词
   * @param statement 
   * @returns 
   */
  private breakWord(statement: string): string {
    // 剔除最后一个单词
    return statement.slice(-this.word.length);
  }

  /**
   * 清空单词
   */
  private clearWord(): void {
    this.word = "";
  }

  /**
   * 测量文本宽度
   * @param statement 
   * @returns 
   */
  private measureTextWidth(statement: string): number {
    const { context, maxLineWidth } = this;

    return Math.max(maxLineWidth, context.measureText(statement).width);
  }

  /**
   * 将文本分割成多行
   * @param text 
   * @param maxWidth 
   * @param lineHeight 
   * @returns 
   */
  private breakTextIntoLines(
    text: string,
    maxWidth: number,
    lineHeight: number
  ): OctopusLayout.TextMetrics {
    const { context } = this;
    const chars = text.split("");
    const lines: string[] = [];
    let currentLine = "";
    let maxLineWidth = 0;
    let char: string;
    let testLine: string;
    let metrics: TextMetrics;
    let wordLastIndex: number;

    for (let i = 0; i < chars.length; i++) {
      char = chars[i];
      testLine = currentLine + char;
      metrics = context.measureText(testLine);

      if (metrics.width > maxWidth || !currentLine) {
        currentLine = testLine;
        this.appendChar(char);
      } else {
        // 处理单词不截断但超出最大宽度的情况
        if (!this.needBreak(char)) {
          currentLine = this.breakWord(currentLine);
        }

        // 截取完成后，发现当前行是空行（如果单词本身长度大于容器长度， 对单词进行截取）
        if (currentLine === "") {
          wordLastIndex = this.word.length - 1;

          currentLine = this.word.slice(0, wordLastIndex) + "-";
          this.clearWord();
          lines.push(currentLine);
          maxLineWidth = this.measureTextWidth(currentLine);
          this.appendChar(this.word[wordLastIndex] + char);
          currentLine = this.word;
        } else {
          lines.push(currentLine);
          maxLineWidth = this.measureTextWidth(currentLine);
          this.appendChar(char);
          currentLine = this.word;
        }
      }
    }

    if (currentLine) {
      lines.push(currentLine);
      maxLineWidth = this.measureTextWidth(currentLine);
    }

    return {
      width: maxLineWidth,
      height: lines.length * lineHeight,
      lines,
    };
  }
}
