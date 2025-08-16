'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var fs = require('fs');
var path = require('path');
var sourceMap = require('source-map');

/**
 * Sourcemap定位器核心类型定义
 * 定义了所有用于sourcemap解析和位置定位的数据结构
 */
/**
 * 错误类型枚举
 * 定义可能出现的错误类型
 */
exports.ErrorType = void 0;
(function (ErrorType) {
    /** 文件不存在 */
    ErrorType["FILE_NOT_FOUND"] = "FILE_NOT_FOUND";
    /** 无效的sourcemap格式 */
    ErrorType["INVALID_SOURCEMAP"] = "INVALID_SOURCEMAP";
    /** 位置超出范围 */
    ErrorType["POSITION_OUT_OF_RANGE"] = "POSITION_OUT_OF_RANGE";
    /** 递归深度超限 */
    ErrorType["MAX_RECURSION_EXCEEDED"] = "MAX_RECURSION_EXCEEDED";
    /** 最大深度超限 */
    ErrorType["MAX_DEPTH_EXCEEDED"] = "MAX_DEPTH_EXCEEDED";
    /** 循环引用 */
    ErrorType["CIRCULAR_REFERENCE"] = "CIRCULAR_REFERENCE";
    /** 解析错误 */
    ErrorType["PARSE_ERROR"] = "PARSE_ERROR";
})(exports.ErrorType || (exports.ErrorType = {}));
/**
 * 自定义错误类
 * 用于表示sourcemap定位过程中的错误
 */
class SourcemapLocatorError extends Error {
    constructor(type, message, details) {
        super(message);
        this.name = 'SourcemapLocatorError';
        this.type = type;
        this.details = details;
    }
}
/**
 * 事件类型枚举
 * 定义解析过程中可能触发的事件
 */
exports.EventType = void 0;
(function (EventType) {
    /** 开始解析 */
    EventType["PARSE_START"] = "PARSE_START";
    /** 解析完成 */
    EventType["PARSE_COMPLETE"] = "PARSE_COMPLETE";
    /** 找到映射 */
    EventType["MAPPING_FOUND"] = "MAPPING_FOUND";
    /** 递归解析 */
    EventType["RECURSIVE_PARSE"] = "RECURSIVE_PARSE";
    /** 缓存命中 */
    EventType["CACHE_HIT"] = "CACHE_HIT";
    /** 缓存未命中 */
    EventType["CACHE_MISS"] = "CACHE_MISS";
    /** 开始定位 */
    EventType["LOCATE_START"] = "locate_start";
    /** 步骤完成 */
    EventType["STEP_COMPLETE"] = "step_complete";
    /** 定位完成 */
    EventType["LOCATE_COMPLETE"] = "locate_complete";
})(exports.EventType || (exports.EventType = {}));

/**
 * Sourcemap解析引擎
 * 负责解析sourcemap文件并提供位置映射功能
 */
/**
 * Sourcemap解析器类
 * 提供sourcemap文件解析和位置定位功能
 */
class SourcemapParser {
    /**
     * 构造函数
     * @param config 解析器配置
     */
    constructor(config = {}) {
        this.cache = new Map();
        this.listeners = new Map();
        this.config = {
            strict: true,
            maxRecursionDepth: 10,
            ...config
        };
    }
    /**
     * 添加事件监听器
     * @param eventType 事件类型
     * @param listener 监听器函数
     */
    addEventListener(eventType, listener) {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, []);
        }
        this.listeners.get(eventType).push(listener);
    }
    /**
     * 移除事件监听器
     * @param eventType 事件类型
     * @param listener 监听器函数
     */
    removeEventListener(eventType, listener) {
        const listeners = this.listeners.get(eventType);
        if (listeners) {
            const index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }
    /**
     * 触发事件
     * @param eventType 事件类型
     * @param data 事件数据
     */
    emitEvent(eventType, data) {
        const listeners = this.listeners.get(eventType);
        if (listeners) {
            const event = {
                type: eventType,
                timestamp: Date.now(),
                data
            };
            listeners.forEach(listener => listener(event));
        }
    }
    /**
     * 解析sourcemap文件
     * @param sourcemapPath sourcemap文件路径
     * @returns SourceMapConsumer实例
     */
    async parseSourcemap(sourcemapPath) {
        this.emitEvent(exports.EventType.PARSE_START, { sourcemapPath });
        // 检查缓存
        if (this.cache.has(sourcemapPath)) {
            this.emitEvent(exports.EventType.CACHE_HIT, { sourcemapPath });
            return this.cache.get(sourcemapPath);
        }
        this.emitEvent(exports.EventType.CACHE_MISS, { sourcemapPath });
        // 检查文件是否存在
        if (!fs.existsSync(sourcemapPath)) {
            throw new SourcemapLocatorError(exports.ErrorType.FILE_NOT_FOUND, `Sourcemap file not found: ${sourcemapPath}`);
        }
        try {
            // 读取并解析sourcemap文件
            const sourcemapContent = fs.readFileSync(sourcemapPath, 'utf-8');
            const sourcemapData = JSON.parse(sourcemapContent);
            // 验证sourcemap格式
            this.validateSourcemap(sourcemapData);
            // 创建SourceMapConsumer
            const consumer = await new sourceMap.SourceMapConsumer(sourcemapData);
            // 缓存结果
            this.cache.set(sourcemapPath, consumer);
            this.emitEvent(exports.EventType.PARSE_COMPLETE, { sourcemapPath });
            return consumer;
        }
        catch (error) {
            if (error instanceof SourcemapLocatorError) {
                throw error;
            }
            throw new SourcemapLocatorError(exports.ErrorType.PARSE_ERROR, `Failed to parse sourcemap: ${error instanceof Error ? error.message : String(error)}`, { sourcemapPath, originalError: error });
        }
    }
    /**
     * 验证sourcemap数据格式
     * @param sourcemapData sourcemap数据
     */
    validateSourcemap(sourcemapData) {
        if (!sourcemapData || typeof sourcemapData !== 'object') {
            throw new SourcemapLocatorError(exports.ErrorType.INVALID_SOURCEMAP, 'Invalid sourcemap format: not an object');
        }
        const requiredFields = ['version', 'sources', 'mappings'];
        for (const field of requiredFields) {
            if (!(field in sourcemapData)) {
                throw new SourcemapLocatorError(exports.ErrorType.INVALID_SOURCEMAP, `Invalid sourcemap format: missing required field '${field}'`);
            }
        }
        if (sourcemapData.version !== 3) {
            throw new SourcemapLocatorError(exports.ErrorType.INVALID_SOURCEMAP, `Unsupported sourcemap version: ${sourcemapData.version}. Only version 3 is supported.`);
        }
    }
    /**
     * 定位源码位置
     * @param request 定位请求
     * @returns 定位结果
     */
    async locate(request) {
        try {
            const consumer = await this.parseSourcemap(request.sourcemapPath);
            // 验证位置参数
            this.validatePosition(request.line, request.column);
            // 查找原始位置
            const originalPosition = consumer.originalPositionFor({
                line: request.line,
                column: request.column
            });
            if (!originalPosition.source) {
                return {
                    success: false,
                    error: `No mapping found for position (${request.line}, ${request.column})`
                };
            }
            this.emitEvent(exports.EventType.MAPPING_FOUND, {
                from: { line: request.line, column: request.column },
                to: { source: originalPosition.source, line: originalPosition.line, column: originalPosition.column }
            });
            // 解析源文件路径
            const sourceFile = this.resolveSourcePath(originalPosition.source, request.sourcemapPath);
            // 获取源码内容
            const sourceContent = this.getSourceContent(consumer, originalPosition.source, sourceFile);
            const result = {
                sourceFile,
                sourceLine: originalPosition.line || 1,
                sourceColumn: originalPosition.column || 0,
                sourceContent,
                isOriginal: true // 单层解析时认为是原始源码
            };
            return {
                success: true,
                result
            };
        }
        catch (error) {
            if (error instanceof SourcemapLocatorError) {
                return {
                    success: false,
                    error: error.message
                };
            }
            return {
                success: false,
                error: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
    /**
     * 验证位置参数
     * @param line 行号
     * @param column 列号
     */
    validatePosition(line, column) {
        if (!Number.isInteger(line) || line < 1) {
            throw new SourcemapLocatorError(exports.ErrorType.POSITION_OUT_OF_RANGE, `Invalid line number: ${line}. Line numbers must be positive integers starting from 1.`);
        }
        if (!Number.isInteger(column) || column < 0) {
            throw new SourcemapLocatorError(exports.ErrorType.POSITION_OUT_OF_RANGE, `Invalid column number: ${column}. Column numbers must be non-negative integers starting from 0.`);
        }
    }
    /**
     * 解析源文件路径
     * @param source 源文件相对路径
     * @param sourcemapPath sourcemap文件路径
     * @returns 解析后的绝对路径
     */
    resolveSourcePath(source, sourcemapPath) {
        const sourcemapDir = path.dirname(sourcemapPath);
        // 如果配置了sourceRoot，优先使用
        if (this.config.sourceRoot) {
            return path.resolve(this.config.sourceRoot, source);
        }
        // 否则相对于sourcemap文件目录解析
        return path.resolve(sourcemapDir, source);
    }
    /**
     * 获取源码内容
     * @param consumer SourceMapConsumer实例
     * @param source 源文件相对路径
     * @param sourceFile 源文件绝对路径
     * @returns 源码内容
     */
    getSourceContent(consumer, source, sourceFile) {
        // 首先尝试从sourcemap中获取内容
        const embeddedContent = consumer.sourceContentFor(source);
        if (embeddedContent) {
            return embeddedContent;
        }
        // 如果sourcemap中没有内容，尝试从文件系统读取
        try {
            if (fs.existsSync(sourceFile)) {
                return fs.readFileSync(sourceFile, 'utf-8');
            }
        }
        catch (error) {
            // 忽略文件读取错误，返回undefined
        }
        return undefined;
    }
    /**
     * 清理缓存
     */
    clearCache() {
        // 销毁所有SourceMapConsumer实例
        for (const consumer of this.cache.values()) {
            consumer.destroy();
        }
        this.cache.clear();
    }
    /**
     * 销毁解析器
     */
    destroy() {
        this.clearCache();
        this.listeners.clear();
    }
}
/**
 * 创建默认的sourcemap解析器实例
 * @param config 解析器配置
 * @returns 解析器实例
 */
function createParser(config) {
    return new SourcemapParser(config);
}

/**
 * 递归定位器
 * 支持多层sourcemap的循环解析，直到找到最终的原始源码位置
 */
/**
 * 递归定位器类
 * 提供多层sourcemap的递归解析功能
 */
class RecursiveLocator {
    /**
     * 构造函数
     * @param config 解析器配置
     */
    constructor(config = {}) {
        this.visitedFiles = new Set();
        this.listeners = new Map();
        this.parser = new SourcemapParser(config);
        this.maxDepth = config.maxRecursionDepth || 10;
    }
    /**
     * 递归定位源码位置
     * @param request 定位请求
     * @returns 定位结果，包含完整的映射链
     */
    async locateRecursively(request) {
        this.visitedFiles.clear();
        const mappingSteps = [];
        // 触发定位开始事件
        this.emitEvent(exports.EventType.LOCATE_START, {
            sourcemapPath: request.sourcemapPath,
            line: request.line,
            column: request.column
        });
        try {
            const result = await this.locateWithDepth(request.sourcemapPath, request.line, request.column, 0, mappingSteps);
            if (result) {
                // 触发定位完成事件
                this.emitEvent(exports.EventType.LOCATE_COMPLETE, {
                    success: true,
                    result,
                    mappingSteps
                });
                return {
                    success: true,
                    result: {
                        ...result,
                        mappingSteps
                    }
                };
            }
            else {
                // 触发定位完成事件（失败）
                this.emitEvent(exports.EventType.LOCATE_COMPLETE, {
                    success: false,
                    error: `No mapping found for position (${request.line}, ${request.column})`
                });
                return {
                    success: false,
                    error: `No mapping found for position (${request.line}, ${request.column})`
                };
            }
        }
        catch (error) {
            const errorMessage = error instanceof SourcemapLocatorError ? error.message :
                `Unexpected error: ${error instanceof Error ? error.message : String(error)}`;
            // 触发定位完成事件（错误）
            this.emitEvent(exports.EventType.LOCATE_COMPLETE, {
                success: false,
                error: errorMessage
            });
            if (error instanceof SourcemapLocatorError) {
                return {
                    success: false,
                    error: error.message
                };
            }
            return {
                success: false,
                error: errorMessage
            };
        }
    }
    /**
     * 带深度控制的递归定位
     * @param sourcemapPath 当前sourcemap文件路径
     * @param line 行号
     * @param column 列号
     * @param depth 当前递归深度
     * @param mappingSteps 映射步骤记录
     * @returns 源码位置信息
     */
    async locateWithDepth(sourcemapPath, line, column, depth, mappingSteps) {
        // 检查递归深度限制
        if (depth >= this.maxDepth) {
            throw new SourcemapLocatorError(exports.ErrorType.MAX_DEPTH_EXCEEDED, `Maximum recursion depth (${this.maxDepth}) exceeded`);
        }
        // 检查循环引用
        const normalizedPath = path.resolve(sourcemapPath);
        if (this.visitedFiles.has(normalizedPath)) {
            throw new SourcemapLocatorError(exports.ErrorType.CIRCULAR_REFERENCE, `Circular reference detected: ${normalizedPath}`);
        }
        this.visitedFiles.add(normalizedPath);
        // 解析当前层级的sourcemap
        const locateResult = await this.parser.locate({
            sourcemapPath,
            line,
            column
        });
        if (!locateResult.success || !locateResult.result) {
            return null;
        }
        const currentResult = locateResult.result;
        // 记录当前映射步骤
        const mappingStep = {
            stepIndex: mappingSteps.length,
            fromFile: normalizedPath,
            toFile: currentResult.sourceFile,
            fromLine: line,
            fromColumn: column,
            toLine: currentResult.sourceLine,
            toColumn: currentResult.sourceColumn,
            depth,
            sourcemapPath: normalizedPath,
            inputPosition: { line, column },
            outputPosition: {
                line: currentResult.sourceLine,
                column: currentResult.sourceColumn
            },
            sourceFile: currentResult.sourceFile
        };
        mappingSteps.push(mappingStep);
        // 触发步骤完成事件
        this.emitEvent(exports.EventType.STEP_COMPLETE, {
            step: mappingStep,
            depth,
            totalSteps: mappingSteps.length
        });
        // 检查是否还有更深层的sourcemap
        const nextSourcemapPath = await this.findNextSourcemap(currentResult.sourceFile);
        if (nextSourcemapPath && fs.existsSync(nextSourcemapPath)) {
            // 继续递归解析
            const deeperResult = await this.locateWithDepth(nextSourcemapPath, currentResult.sourceLine, currentResult.sourceColumn, depth + 1, mappingSteps);
            if (deeperResult) {
                // 返回更深层的结果，但保留当前层的映射信息
                return {
                    ...deeperResult,
                    isOriginal: true // 最终结果标记为原始源码
                };
            }
        }
        // 没有更深层的sourcemap，当前结果就是最终结果
        return {
            ...currentResult,
            isOriginal: true
        };
    }
    /**
     * 查找下一层sourcemap文件
     * @param sourceFile 源文件路径
     * @returns sourcemap文件路径，如果不存在则返回null
     */
    async findNextSourcemap(sourceFile) {
        // 首先尝试从文件内容中提取 sourcemap 引用
        const extractedPath = await this.extractSourcemapFromFile(sourceFile);
        if (extractedPath) {
            const resolvedPath = path.resolve(path.dirname(sourceFile), extractedPath);
            return resolvedPath;
        }
        // 如果没有找到引用，尝试常见的命名模式
        const baseName = sourceFile.split('/').pop()?.replace(/\.[^.]+$/, '') || '';
        const dir = path.dirname(sourceFile);
        const patterns = [
            `${baseName}.js.map`,
            `${baseName}.map`,
            `${baseName}.ts.map`,
            `${baseName}.jsx.map`,
            `${baseName}.tsx.map`
        ];
        for (const pattern of patterns) {
            const fullPath = path.resolve(dir, pattern);
            if (fs.existsSync(fullPath)) {
                return fullPath;
            }
        }
        return null;
    }
    /**
     * 从JavaScript文件中提取sourcemap引用
     * @param sourceFile JavaScript文件路径
     * @returns sourcemap文件路径，如果不存在则返回null
     */
    extractSourcemapFromFile(sourceFile) {
        try {
            // 只处理JavaScript相关文件
            if (!/\.(js|jsx|ts|tsx)$/.test(sourceFile)) {
                return null;
            }
            if (!fs.existsSync(sourceFile)) {
                return null;
            }
            const content = fs.readFileSync(sourceFile, 'utf-8');
            // 查找sourcemap引用注释
            const sourcemapRegex = /\/\/#\s*sourceMappingURL=(.+)$/m;
            const match = content.match(sourcemapRegex);
            if (match && match[1]) {
                const sourcemapUrl = match[1].trim();
                // 如果是相对路径，解析为绝对路径
                if (!sourcemapUrl.startsWith('http')) {
                    const sourceDir = path.dirname(sourceFile);
                    const sourcemapPath = path.resolve(sourceDir, sourcemapUrl);
                    if (fs.existsSync(sourcemapPath)) {
                        return sourcemapPath;
                    }
                }
            }
            return null;
        }
        catch (error) {
            // 读取文件失败，返回null
            return null;
        }
    }
    /**
     * 批量递归定位
     * @param request 批量定位请求
     * @returns 批量定位结果
     */
    async batchLocateRecursively(request) {
        const results = [];
        const errors = [];
        for (const locationRequest of request.locations) {
            try {
                const result = await this.locateRecursively(locationRequest);
                results.push(result);
                if (!result.success) {
                    errors.push(`${locationRequest.sourcemapPath}:${locationRequest.line}:${locationRequest.column} - ${result.error}`);
                }
            }
            catch (error) {
                const errorMsg = error instanceof Error ? error.message : String(error);
                const failedResult = {
                    success: false,
                    error: errorMsg
                };
                results.push(failedResult);
                errors.push(`${locationRequest.sourcemapPath}:${locationRequest.line}:${locationRequest.column} - ${errorMsg}`);
            }
        }
        const successCount = results.filter(r => r.success).length;
        const totalCount = results.length;
        return {
            success: successCount > 0,
            results,
            summary: {
                total: totalCount,
                successful: successCount,
                failed: totalCount - successCount,
                errors: errors.length > 0 ? errors : undefined
            }
        };
    }
    /**
     * 获取映射链的摘要信息
     * @param mappingSteps 映射步骤
     * @returns 映射链摘要
     */
    getMappingChainSummary(mappingSteps) {
        if (mappingSteps.length === 0) {
            return 'No mapping steps';
        }
        const chain = mappingSteps.map((step, index) => {
            const input = `(${step.inputPosition.line},${step.inputPosition.column})`;
            const output = `(${step.outputPosition.line},${step.outputPosition.column})`;
            const file = step.sourceFile.split('/').pop() || step.sourceFile;
            return `${index + 1}. ${input} → ${output} in ${file}`;
        }).join('\n');
        return `Mapping chain (${mappingSteps.length} steps):\n${chain}`;
    }
    /**
     * 触发事件
     * @param eventType 事件类型
     * @param data 事件数据
     */
    emitEvent(eventType, data) {
        const listeners = this.listeners.get(eventType);
        if (listeners) {
            const event = {
                type: eventType,
                timestamp: Date.now(),
                data
            };
            listeners.forEach(listener => listener(event));
        }
    }
    /**
     * 添加事件监听器
     * @param eventType 事件类型
     * @param listener 监听器函数
     */
    addEventListener(eventType, listener) {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, []);
        }
        this.listeners.get(eventType).push(listener);
        // 同时添加到parser的监听器中
        this.parser.addEventListener(eventType, listener);
    }
    /**
     * 移除事件监听器
     * @param eventType 事件类型
     * @param listener 监听器函数
     */
    removeEventListener(eventType, listener) {
        const listeners = this.listeners.get(eventType);
        if (listeners) {
            const index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
        // 同时从parser中移除
        this.parser.removeEventListener(eventType, listener);
    }
    /**
     * 清理缓存
     */
    clearCache() {
        this.parser.clearCache();
        this.visitedFiles.clear();
    }
    /**
     * 销毁定位器
     */
    destroy() {
        this.parser.destroy();
        this.visitedFiles.clear();
    }
}
/**
 * 创建递归定位器实例
 * @param config 解析器配置
 * @returns 递归定位器实例
 */
function createRecursiveLocator(config) {
    return new RecursiveLocator(config);
}

/**
 * Sourcemap定位器主入口文件
 * 提供统一的API接口供外部程序调用
 */
/**
 * Sourcemap定位器API类
 * 提供高级API接口，封装常用功能
 */
class SourcemapLocatorAPI {
    /**
     * 构造函数
     * @param config 解析器配置
     */
    constructor(config) {
        this.locator = new RecursiveLocator(config);
        this.parser = new SourcemapParser(config);
    }
    /**
     * 定位单个位置（支持递归）
     * @param sourcemapPath sourcemap文件路径
     * @param line 行号（1-based）
     * @param column 列号（0-based）
     * @returns 定位结果
     */
    async locate(sourcemapPath, line, column) {
        const request = {
            sourcemapPath,
            line,
            column
        };
        return this.locator.locateRecursively(request);
    }
    /**
     * 定位单个位置（仅单层解析）
     * @param sourcemapPath sourcemap文件路径
     * @param line 行号（1-based）
     * @param column 列号（0-based）
     * @returns 定位结果
     */
    async locateOnce(sourcemapPath, line, column) {
        const request = {
            sourcemapPath,
            line,
            column
        };
        return this.parser.locate(request);
    }
    /**
     * 批量定位多个位置
     * @param requests 定位请求数组
     * @returns 批量定位结果
     */
    async batchLocate(requests) {
        const batchRequest = {
            locations: requests
        };
        return this.locator.batchLocateRecursively(batchRequest);
    }
    /**
     * 验证sourcemap文件
     * @param sourcemapPath sourcemap文件路径
     * @returns 验证结果
     */
    async validateSourcemap(sourcemapPath) {
        try {
            const consumer = await this.parser.parseSourcemap(sourcemapPath);
            consumer.destroy();
            return { valid: true };
        }
        catch (error) {
            return {
                valid: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
    /**
     * 获取sourcemap信息
     * @param sourcemapPath sourcemap文件路径
     * @returns sourcemap信息
     */
    async getSourcemapInfo(sourcemapPath) {
        const consumer = await this.parser.parseSourcemap(sourcemapPath);
        // 从原始sourcemap数据中获取完整信息，因为consumer对象的类型定义不完整
        const rawSourceMap = JSON.parse(await fs.promises.readFile(sourcemapPath, 'utf-8'));
        const info = {
            version: 3,
            sources: rawSourceMap.sources || [],
            names: rawSourceMap.names || [],
            sourceRoot: rawSourceMap.sourceRoot || undefined
        };
        consumer.destroy();
        return info;
    }
    /**
     * 添加事件监听器
     * @param eventType 事件类型
     * @param listener 监听器函数
     */
    addEventListener(eventType, listener) {
        this.locator.addEventListener(eventType, listener);
    }
    /**
     * 移除事件监听器
     * @param eventType 事件类型
     * @param listener 监听器函数
     */
    removeEventListener(eventType, listener) {
        this.locator.removeEventListener(eventType, listener);
    }
    /**
     * 清理缓存
     */
    clearCache() {
        this.locator.clearCache();
        this.parser.clearCache();
    }
    /**
     * 销毁API实例
     */
    destroy() {
        this.locator.destroy();
        this.parser.destroy();
    }
}
/**
 * 便捷函数：创建API实例
 * @param config 解析器配置
 * @returns API实例
 */
function createLocator(config) {
    return new SourcemapLocatorAPI(config);
}
/**
 * 便捷函数：快速定位单个位置
 * @param sourcemapPath sourcemap文件路径
 * @param line 行号（1-based）
 * @param column 列号（0-based）
 * @param config 解析器配置
 * @returns 定位结果
 */
async function locate(sourcemapPath, line, column, config) {
    const api = new SourcemapLocatorAPI(config);
    try {
        return await api.locate(sourcemapPath, line, column);
    }
    finally {
        api.destroy();
    }
}
/**
 * 便捷函数：快速批量定位
 * @param requests 定位请求数组
 * @param config 解析器配置
 * @returns 批量定位结果
 */
async function batchLocate(requests, config) {
    const api = new SourcemapLocatorAPI(config);
    try {
        return await api.batchLocate(requests);
    }
    finally {
        api.destroy();
    }
}
/**
 * 便捷函数：验证sourcemap文件
 * @param sourcemapPath sourcemap文件路径
 * @param config 解析器配置
 * @returns 验证结果
 */
async function validateSourcemap(sourcemapPath, config) {
    const api = new SourcemapLocatorAPI(config);
    try {
        return await api.validateSourcemap(sourcemapPath);
    }
    finally {
        api.destroy();
    }
}
/**
 * 便捷函数：获取sourcemap信息
 * @param sourcemapPath sourcemap文件路径
 * @param config 解析器配置
 * @returns sourcemap信息
 */
async function getSourcemapInfo(sourcemapPath, config) {
    const api = new SourcemapLocatorAPI(config);
    try {
        return await api.getSourcemapInfo(sourcemapPath);
    }
    finally {
        api.destroy();
    }
}

exports.RecursiveLocator = RecursiveLocator;
exports.SourcemapLocatorAPI = SourcemapLocatorAPI;
exports.SourcemapLocatorError = SourcemapLocatorError;
exports.SourcemapParser = SourcemapParser;
exports.batchLocate = batchLocate;
exports.createLocator = createLocator;
exports.createParser = createParser;
exports.createRecursiveLocator = createRecursiveLocator;
exports.default = SourcemapLocatorAPI;
exports.getSourcemapInfo = getSourcemapInfo;
exports.locate = locate;
exports.validateSourcemap = validateSourcemap;
//# sourceMappingURL=index.js.map
