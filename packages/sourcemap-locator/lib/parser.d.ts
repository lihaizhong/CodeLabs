/**
 * Sourcemap解析引擎
 * 负责解析sourcemap文件并提供位置映射功能
 */
import { SourceMapConsumer } from 'source-map';
import { LocationRequest, LocateResult, ParserConfig, EventType, EventListener } from './types';
/**
 * Sourcemap解析器类
 * 提供sourcemap文件解析和位置定位功能
 */
export declare class SourcemapParser {
    private config;
    private cache;
    private listeners;
    /**
     * 构造函数
     * @param config 解析器配置
     */
    constructor(config?: ParserConfig);
    /**
     * 添加事件监听器
     * @param eventType 事件类型
     * @param listener 监听器函数
     */
    addEventListener(eventType: EventType, listener: EventListener): void;
    /**
     * 移除事件监听器
     * @param eventType 事件类型
     * @param listener 监听器函数
     */
    removeEventListener(eventType: EventType, listener: EventListener): void;
    /**
     * 触发事件
     * @param eventType 事件类型
     * @param data 事件数据
     */
    private emitEvent;
    /**
     * 解析sourcemap文件
     * @param sourcemapPath sourcemap文件路径
     * @returns SourceMapConsumer实例
     */
    parseSourcemap(sourcemapPath: string): Promise<SourceMapConsumer>;
    /**
     * 验证sourcemap数据格式
     * @param sourcemapData sourcemap数据
     */
    private validateSourcemap;
    /**
     * 定位源码位置
     * @param request 定位请求
     * @returns 定位结果
     */
    locate(request: LocationRequest): Promise<LocateResult>;
    /**
     * 验证位置参数
     * @param line 行号
     * @param column 列号
     */
    private validatePosition;
    /**
     * 解析源文件路径
     * @param source 源文件相对路径
     * @param sourcemapPath sourcemap文件路径
     * @returns 解析后的绝对路径
     */
    private resolveSourcePath;
    /**
     * 获取源码内容
     * @param consumer SourceMapConsumer实例
     * @param source 源文件相对路径
     * @param sourceFile 源文件绝对路径
     * @returns 源码内容
     */
    private getSourceContent;
    /**
     * 清理缓存
     */
    clearCache(): void;
    /**
     * 销毁解析器
     */
    destroy(): void;
}
/**
 * 创建默认的sourcemap解析器实例
 * @param config 解析器配置
 * @returns 解析器实例
 */
export declare function createParser(config?: ParserConfig): SourcemapParser;
//# sourceMappingURL=parser.d.ts.map