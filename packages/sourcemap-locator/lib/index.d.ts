/**
 * Sourcemap定位器主入口文件
 * 提供统一的API接口供外部程序调用
 */
export * from './types';
export * from './parser';
export * from './recursive-locator';
import { LocationRequest, LocateResult, BatchLocateResult, ParserConfig, EventType } from './types';
/**
 * Sourcemap定位器API类
 * 提供高级API接口，封装常用功能
 */
export declare class SourcemapLocatorAPI {
    private locator;
    private parser;
    /**
     * 构造函数
     * @param config 解析器配置
     */
    constructor(config?: ParserConfig);
    /**
     * 定位单个位置（支持递归）
     * @param sourcemapPath sourcemap文件路径
     * @param line 行号（1-based）
     * @param column 列号（0-based）
     * @returns 定位结果
     */
    locate(sourcemapPath: string, line: number, column: number): Promise<LocateResult>;
    /**
     * 定位单个位置（仅单层解析）
     * @param sourcemapPath sourcemap文件路径
     * @param line 行号（1-based）
     * @param column 列号（0-based）
     * @returns 定位结果
     */
    locateOnce(sourcemapPath: string, line: number, column: number): Promise<LocateResult>;
    /**
     * 批量定位多个位置
     * @param requests 定位请求数组
     * @returns 批量定位结果
     */
    batchLocate(requests: LocationRequest[]): Promise<BatchLocateResult>;
    /**
     * 验证sourcemap文件
     * @param sourcemapPath sourcemap文件路径
     * @returns 验证结果
     */
    validateSourcemap(sourcemapPath: string): Promise<{
        valid: boolean;
        error?: string;
    }>;
    /**
     * 获取sourcemap信息
     * @param sourcemapPath sourcemap文件路径
     * @returns sourcemap信息
     */
    getSourcemapInfo(sourcemapPath: string): Promise<{
        version: number;
        sources: string[];
        names: string[];
        sourceRoot?: string;
    }>;
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
     * 清理缓存
     */
    clearCache(): void;
    /**
     * 销毁API实例
     */
    destroy(): void;
}
/**
 * 便捷函数：创建API实例
 * @param config 解析器配置
 * @returns API实例
 */
export declare function createLocator(config?: ParserConfig): SourcemapLocatorAPI;
/**
 * 便捷函数：快速定位单个位置
 * @param sourcemapPath sourcemap文件路径
 * @param line 行号（1-based）
 * @param column 列号（0-based）
 * @param config 解析器配置
 * @returns 定位结果
 */
export declare function locate(sourcemapPath: string, line: number, column: number, config?: ParserConfig): Promise<LocateResult>;
/**
 * 便捷函数：快速批量定位
 * @param requests 定位请求数组
 * @param config 解析器配置
 * @returns 批量定位结果
 */
export declare function batchLocate(requests: LocationRequest[], config?: ParserConfig): Promise<BatchLocateResult>;
/**
 * 便捷函数：验证sourcemap文件
 * @param sourcemapPath sourcemap文件路径
 * @param config 解析器配置
 * @returns 验证结果
 */
export declare function validateSourcemap(sourcemapPath: string, config?: ParserConfig): Promise<{
    valid: boolean;
    error?: string;
}>;
/**
 * 便捷函数：获取sourcemap信息
 * @param sourcemapPath sourcemap文件路径
 * @param config 解析器配置
 * @returns sourcemap信息
 */
export declare function getSourcemapInfo(sourcemapPath: string, config?: ParserConfig): Promise<{
    version: number;
    sources: string[];
    names: string[];
    sourceRoot?: string;
}>;
export default SourcemapLocatorAPI;
//# sourceMappingURL=index.d.ts.map