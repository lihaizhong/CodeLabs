"use strict";
/**
 * Sourcemap解析引擎
 * 负责解析sourcemap文件并提供位置映射功能
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourcemapParser = void 0;
exports.createParser = createParser;
const fs_1 = require("fs");
const path_1 = require("path");
const source_map_1 = require("source-map");
const types_1 = require("./types");
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
        this.emitEvent(types_1.EventType.PARSE_START, { sourcemapPath });
        // 检查缓存
        if (this.cache.has(sourcemapPath)) {
            this.emitEvent(types_1.EventType.CACHE_HIT, { sourcemapPath });
            return this.cache.get(sourcemapPath);
        }
        this.emitEvent(types_1.EventType.CACHE_MISS, { sourcemapPath });
        // 检查文件是否存在
        if (!(0, fs_1.existsSync)(sourcemapPath)) {
            throw new types_1.SourcemapLocatorError(types_1.ErrorType.FILE_NOT_FOUND, `Sourcemap file not found: ${sourcemapPath}`);
        }
        try {
            // 读取并解析sourcemap文件
            const sourcemapContent = (0, fs_1.readFileSync)(sourcemapPath, 'utf-8');
            const sourcemapData = JSON.parse(sourcemapContent);
            // 验证sourcemap格式
            this.validateSourcemap(sourcemapData);
            // 创建SourceMapConsumer
            const consumer = await new source_map_1.SourceMapConsumer(sourcemapData);
            // 缓存结果
            this.cache.set(sourcemapPath, consumer);
            this.emitEvent(types_1.EventType.PARSE_COMPLETE, { sourcemapPath });
            return consumer;
        }
        catch (error) {
            if (error instanceof types_1.SourcemapLocatorError) {
                throw error;
            }
            throw new types_1.SourcemapLocatorError(types_1.ErrorType.PARSE_ERROR, `Failed to parse sourcemap: ${error instanceof Error ? error.message : String(error)}`, { sourcemapPath, originalError: error });
        }
    }
    /**
     * 验证sourcemap数据格式
     * @param sourcemapData sourcemap数据
     */
    validateSourcemap(sourcemapData) {
        if (!sourcemapData || typeof sourcemapData !== 'object') {
            throw new types_1.SourcemapLocatorError(types_1.ErrorType.INVALID_SOURCEMAP, 'Invalid sourcemap format: not an object');
        }
        const requiredFields = ['version', 'sources', 'mappings'];
        for (const field of requiredFields) {
            if (!(field in sourcemapData)) {
                throw new types_1.SourcemapLocatorError(types_1.ErrorType.INVALID_SOURCEMAP, `Invalid sourcemap format: missing required field '${field}'`);
            }
        }
        if (sourcemapData.version !== 3) {
            throw new types_1.SourcemapLocatorError(types_1.ErrorType.INVALID_SOURCEMAP, `Unsupported sourcemap version: ${sourcemapData.version}. Only version 3 is supported.`);
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
            this.emitEvent(types_1.EventType.MAPPING_FOUND, {
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
            if (error instanceof types_1.SourcemapLocatorError) {
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
            throw new types_1.SourcemapLocatorError(types_1.ErrorType.POSITION_OUT_OF_RANGE, `Invalid line number: ${line}. Line numbers must be positive integers starting from 1.`);
        }
        if (!Number.isInteger(column) || column < 0) {
            throw new types_1.SourcemapLocatorError(types_1.ErrorType.POSITION_OUT_OF_RANGE, `Invalid column number: ${column}. Column numbers must be non-negative integers starting from 0.`);
        }
    }
    /**
     * 解析源文件路径
     * @param source 源文件相对路径
     * @param sourcemapPath sourcemap文件路径
     * @returns 解析后的绝对路径
     */
    resolveSourcePath(source, sourcemapPath) {
        const sourcemapDir = (0, path_1.dirname)(sourcemapPath);
        // 如果配置了sourceRoot，优先使用
        if (this.config.sourceRoot) {
            return (0, path_1.resolve)(this.config.sourceRoot, source);
        }
        // 否则相对于sourcemap文件目录解析
        return (0, path_1.resolve)(sourcemapDir, source);
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
            if ((0, fs_1.existsSync)(sourceFile)) {
                return (0, fs_1.readFileSync)(sourceFile, 'utf-8');
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
exports.SourcemapParser = SourcemapParser;
/**
 * 创建默认的sourcemap解析器实例
 * @param config 解析器配置
 * @returns 解析器实例
 */
function createParser(config) {
    return new SourcemapParser(config);
}
//# sourceMappingURL=parser.js.map