import { SourceMapConsumer } from 'source-map';

/**
 * Sourcemap定位器核心类型定义
 * 定义了所有用于sourcemap解析和位置定位的数据结构
 */
/**
 * 源码位置信息
 * 表示定位到的最终源码位置
 */
interface SourceLocation {
    /** 源文件路径 */
    sourceFile: string;
    /** 源码行号(1-based) */
    sourceLine: number;
    /** 源码列号(0-based) */
    sourceColumn: number;
    /** 源码内容(可选) */
    sourceContent?: string;
    /** 是否为最终的原始源码 */
    isOriginal: boolean;
    /** 映射步骤信息(可选) */
    mappingSteps?: MappingStep[];
}
/**
 * 映射步骤信息
 * 表示sourcemap映射链中的一个步骤
 */
interface MappingStep {
    /** 步骤索引 */
    stepIndex: number;
    /** 源文件路径 */
    fromFile: string;
    /** 目标文件路径 */
    toFile: string;
    /** 源文件行号 */
    fromLine: number;
    /** 源文件列号 */
    fromColumn: number;
    /** 目标文件行号 */
    toLine: number;
    /** 目标文件列号 */
    toColumn: number;
    /** 输入位置信息 */
    inputPosition: {
        line: number;
        column: number;
    };
    /** 输出位置信息 */
    outputPosition: {
        line: number;
        column: number;
    };
    /** 源文件路径 */
    sourceFile: string;
    /** 递归深度 */
    depth: number;
    /** sourcemap文件路径 */
    sourcemapPath: string;
}
/**
 * 位置定位请求
 * 用于请求sourcemap位置定位的参数
 */
interface LocationRequest {
    /** sourcemap文件路径 */
    sourcemapPath: string;
    /** 目标行号(1-based) */
    line: number;
    /** 目标列号(0-based) */
    column: number;
    /** 是否启用递归解析 */
    recursive?: boolean;
}
/**
 * 定位结果
 * 包含定位操作的完整结果信息
 */
interface LocateResult {
    /** 操作是否成功 */
    success: boolean;
    /** 定位结果(成功时) */
    result?: SourceLocation;
    /** 映射链路信息(递归模式时) */
    mappingChain?: MappingStep[];
    /** 错误信息(失败时) */
    error?: string;
}
/**
 * 批量定位请求
 * 用于批量处理多个位置定位请求
 */
interface BatchLocationRequest {
    /** 批量定位请求列表 */
    locations: LocationRequest[];
}
/**
 * 批量定位结果
 * 包含批量定位操作的完整结果
 */
interface BatchLocateResult {
    /** 操作是否成功 */
    success: boolean;
    /** 批量定位结果列表 */
    results: LocateResult[];
    /** 错误信息(失败时) */
    error?: string;
    /** 批量处理摘要信息 */
    summary?: {
        total: number;
        successful: number;
        failed: number;
        errors?: string[];
    };
}
/**
 * Sourcemap文件数据结构
 * 标准的sourcemap文件格式定义
 */
interface SourceMapData {
    /** sourcemap版本号 */
    version: number;
    /** 源文件路径列表 */
    sources: string[];
    /** 变量名列表 */
    names: string[];
    /** 映射字符串 */
    mappings: string;
    /** 源文件内容列表(可选) */
    sourcesContent?: string[];
    /** 源文件根路径(可选) */
    sourceRoot?: string;
    /** 生成文件名 */
    file: string;
    /** 索引段落(可选，用于索引sourcemap) */
    sections?: Array<{
        offset: {
            line: number;
            column: number;
        };
        map: SourceMapData;
    }>;
}
/**
 * 缓存配置
 * 用于配置sourcemap解析缓存
 */
interface CacheConfig {
    /** 最大缓存大小 */
    maxSize: number;
    /** 缓存过期时间(秒) */
    ttl: number;
    /** 是否启用Redis缓存 */
    enableRedis?: boolean;
    /** Redis连接URL */
    redisUrl?: string;
}
/**
 * CLI选项配置
 * 命令行工具的配置选项
 */
interface CLIOptions {
    /** sourcemap文件路径 */
    sourcemap: string;
    /** 目标行号 */
    line: number;
    /** 目标列号 */
    column: number;
    /** 是否启用递归解析 */
    recursive: boolean;
    /** 输出格式 */
    output: 'json' | 'table' | 'raw';
    /** 是否启用详细输出 */
    verbose: boolean;
}
/**
 * 解析器配置
 * sourcemap解析器的配置选项
 */
interface ParserConfig {
    /** 缓存配置 */
    cache?: CacheConfig;
    /** 是否启用严格模式 */
    strict?: boolean;
    /** 最大递归深度 */
    maxRecursionDepth?: number;
    /** 源文件根路径 */
    sourceRoot?: string;
}
/**
 * 解析上下文
 * 用于在解析过程中传递上下文信息
 */
interface ParseContext {
    /** 当前解析深度 */
    depth: number;
    /** 已访问的文件路径集合 */
    visitedFiles: Set<string>;
    /** 映射链路 */
    mappingChain: MappingStep[];
    /** 解析器配置 */
    config: ParserConfig;
}
/**
 * 错误类型枚举
 * 定义可能出现的错误类型
 */
declare enum ErrorType {
    /** 文件不存在 */
    FILE_NOT_FOUND = "FILE_NOT_FOUND",
    /** 无效的sourcemap格式 */
    INVALID_SOURCEMAP = "INVALID_SOURCEMAP",
    /** 位置超出范围 */
    POSITION_OUT_OF_RANGE = "POSITION_OUT_OF_RANGE",
    /** 递归深度超限 */
    MAX_RECURSION_EXCEEDED = "MAX_RECURSION_EXCEEDED",
    /** 最大深度超限 */
    MAX_DEPTH_EXCEEDED = "MAX_DEPTH_EXCEEDED",
    /** 循环引用 */
    CIRCULAR_REFERENCE = "CIRCULAR_REFERENCE",
    /** 解析错误 */
    PARSE_ERROR = "PARSE_ERROR"
}
/**
 * 自定义错误类
 * 用于表示sourcemap定位过程中的错误
 */
declare class SourcemapLocatorError extends Error {
    readonly type: ErrorType;
    readonly details?: any;
    constructor(type: ErrorType, message: string, details?: any);
}
/**
 * 事件类型枚举
 * 定义解析过程中可能触发的事件
 */
declare enum EventType {
    /** 开始解析 */
    PARSE_START = "PARSE_START",
    /** 解析完成 */
    PARSE_COMPLETE = "PARSE_COMPLETE",
    /** 找到映射 */
    MAPPING_FOUND = "MAPPING_FOUND",
    /** 递归解析 */
    RECURSIVE_PARSE = "RECURSIVE_PARSE",
    /** 缓存命中 */
    CACHE_HIT = "CACHE_HIT",
    /** 缓存未命中 */
    CACHE_MISS = "CACHE_MISS",
    /** 开始定位 */
    LOCATE_START = "locate_start",
    /** 步骤完成 */
    STEP_COMPLETE = "step_complete",
    /** 定位完成 */
    LOCATE_COMPLETE = "locate_complete"
}
/**
 * 事件数据接口
 * 定义事件携带的数据结构
 */
interface EventData {
    /** 事件类型 */
    type: EventType;
    /** 时间戳 */
    timestamp: number;
    /** 事件数据 */
    data?: any;
}
/**
 * 事件监听器类型
 * 定义事件监听器的函数签名
 */
type EventListener$1 = (event: EventData) => void;

/**
 * Sourcemap解析引擎
 * 负责解析sourcemap文件并提供位置映射功能
 */

/**
 * Sourcemap解析器类
 * 提供sourcemap文件解析和位置定位功能
 */
declare class SourcemapParser {
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
    addEventListener(eventType: EventType, listener: EventListener$1): void;
    /**
     * 移除事件监听器
     * @param eventType 事件类型
     * @param listener 监听器函数
     */
    removeEventListener(eventType: EventType, listener: EventListener$1): void;
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
declare function createParser(config?: ParserConfig): SourcemapParser;

/**
 * 递归定位器
 * 支持多层sourcemap的循环解析，直到找到最终的原始源码位置
 */

/**
 * 递归定位器类
 * 提供多层sourcemap的递归解析功能
 */
declare class RecursiveLocator {
    private parser;
    private maxDepth;
    private visitedFiles;
    private listeners;
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
     * 从JavaScript文件中提取sourcemap引用
     * @param sourceFile JavaScript文件路径
     * @returns sourcemap文件路径，如果不存在则返回null
     */
    private extractSourcemapFromFile;
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
     * 触发事件
     * @param eventType 事件类型
     * @param data 事件数据
     */
    private emitEvent;
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
declare function createRecursiveLocator(config?: ParserConfig): RecursiveLocator;

/**
 * Sourcemap定位器主入口文件
 * 提供统一的API接口供外部程序调用
 */

/**
 * Sourcemap定位器API类
 * 提供高级API接口，封装常用功能
 */
declare class SourcemapLocatorAPI {
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
declare function createLocator(config?: ParserConfig): SourcemapLocatorAPI;
/**
 * 便捷函数：快速定位单个位置
 * @param sourcemapPath sourcemap文件路径
 * @param line 行号（1-based）
 * @param column 列号（0-based）
 * @param config 解析器配置
 * @returns 定位结果
 */
declare function locate(sourcemapPath: string, line: number, column: number, config?: ParserConfig): Promise<LocateResult>;
/**
 * 便捷函数：快速批量定位
 * @param requests 定位请求数组
 * @param config 解析器配置
 * @returns 批量定位结果
 */
declare function batchLocate(requests: LocationRequest[], config?: ParserConfig): Promise<BatchLocateResult>;
/**
 * 便捷函数：验证sourcemap文件
 * @param sourcemapPath sourcemap文件路径
 * @param config 解析器配置
 * @returns 验证结果
 */
declare function validateSourcemap(sourcemapPath: string, config?: ParserConfig): Promise<{
    valid: boolean;
    error?: string;
}>;
/**
 * 便捷函数：获取sourcemap信息
 * @param sourcemapPath sourcemap文件路径
 * @param config 解析器配置
 * @returns sourcemap信息
 */
declare function getSourcemapInfo(sourcemapPath: string, config?: ParserConfig): Promise<{
    version: number;
    sources: string[];
    names: string[];
    sourceRoot?: string;
}>;

export { ErrorType, EventType, RecursiveLocator, SourcemapLocatorAPI, SourcemapLocatorError, SourcemapParser, batchLocate, createLocator, createParser, createRecursiveLocator, SourcemapLocatorAPI as default, getSourcemapInfo, locate, validateSourcemap };
export type { BatchLocateResult, BatchLocationRequest, CLIOptions, CacheConfig, EventData, EventListener$1 as EventListener, LocateResult, LocationRequest, MappingStep, ParseContext, ParserConfig, SourceLocation, SourceMapData };
