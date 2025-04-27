import { LayoutContextOptions, TextMetrics } from '../types';
/**
 * 布局上下文实现类
 * 提供布局计算所需的环境和工具方法
 */
export declare class LayoutContext {
    /**
     * 获取布局上下文的宽度
     */
    readonly width: number;
    /**
     * 获取布局上下文的高度
     */
    readonly height: number;
    /**
     * 获取设备像素比
     */
    readonly devicePixelRatio: number;
    private canvas;
    private ctx;
    constructor(options: LayoutContextOptions);
    /**
     * 测量文本尺寸
     * @param text 要测量的文本
     * @param fontSize 字体大小
     * @param fontFamily 字体族
     * @param maxWidth 最大宽度，用于计算换行
     * @param lineHeight 行高
     */
    measureText(text: string, fontSize: number, fontFamily?: string, maxWidth?: number, lineHeight?: number): TextMetrics;
    /**
     * 将文本按照最大宽度断行
     */
    private breakTextIntoLines;
    /**
     * 测量中文文本，按字符分割
     * 针对中文等不使用空格分词的语言
     */
    measureCJKText(text: string, fontSize: number, fontFamily?: string, maxWidth?: number, lineHeight?: number): TextMetrics;
    /**
     * 将中文文本按照最大宽度断行，按字符分割
     */
    private breakCJKTextIntoLines;
}
