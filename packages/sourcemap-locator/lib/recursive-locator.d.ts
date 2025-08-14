/**
 * 递归定位器
 * 支持多层sourcemap的循环解析，直到找到最终的原始源码位置
 */
import { LocationRequest, LocateResult, MappingStep, BatchLocationRequest, BatchLocateResult, ParserConfig, EventType } from './types';
/**
 * 递归定位器类
 * 提供多层sourcemap的递归解析功能
 */
export declare class RecursiveLocator {
    private parser;
    private maxDepth;
    private visitedFiles;
    /**
     * 构造函数
     * @param config 解析器配置
     */
    constructor(config?: ParserConfig);
    /**
     * 递归定位源码位置
     * @param request 定位请求
     * @returns 定位结果，包含完整的映射链
     */
    locateRecursively(request: LocationRequest): Promise<LocateResult>;
    /**
     * 带深度控制的递归定位
     * @param sourcemapPath 当前sourcemap文件路径
     * @param line 行号
     * @param column 列号
     * @param depth 当前递归深度
     * @param mappingSteps 映射步骤记录
     * @returns 源码位置信息
     */
    private locateWithDepth;
    /**
     * 查找下一层sourcemap文件
     * @param sourceFile 源文件路径
     * @returns sourcemap文件路径，如果不存在则返回null
     */
    private findNextSourcemap;
    /**
     * 批量递归定位
     * @param request 批量定位请求
     * @returns 批量定位结果
     */
    batchLocateRecursively(request: BatchLocationRequest): Promise<BatchLocateResult>;
    /**
     * 获取映射链的摘要信息
     * @param mappingSteps 映射步骤
     * @returns 映射链摘要
     */
    getMappingChainSummary(mappingSteps: MappingStep[]): string;
    /**
     * 添加事件监听器
     * @param eventType 事件类型
     * @param listener 监听器函数
     */
    addEventListener(eventType: EventType, listener: (event: any) => void): void;
    /**
     * 移除事件监听器
     * @param eventType 事件类型
     * @param listener 监听器函数
     */
    removeEventListener(eventType: EventType, listener: (event: any) => void): void;
    /**
     * 清理缓存
     */
    clearCache(): void;
    /**
     * 销毁定位器
     */
    destroy(): void;
}
/**
 * 创建递归定位器实例
 * @param config 解析器配置
 * @returns 递归定位器实例
 */
export declare function createRecursiveLocator(config?: ParserConfig): RecursiveLocator;
//# sourceMappingURL=recursive-locator.d.ts.map