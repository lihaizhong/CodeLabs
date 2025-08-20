'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var fs = require('fs');
var path = require('path');
var sourceMap = require('source-map');
var commander = require('commander');
var require$$0 = require('os');
var require$$1 = require('tty');

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

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var ansiStyles$1 = {exports: {}};

var colorName;
var hasRequiredColorName;

function requireColorName () {
	if (hasRequiredColorName) return colorName;
	hasRequiredColorName = 1;

	colorName = {
		"aliceblue": [240, 248, 255],
		"antiquewhite": [250, 235, 215],
		"aqua": [0, 255, 255],
		"aquamarine": [127, 255, 212],
		"azure": [240, 255, 255],
		"beige": [245, 245, 220],
		"bisque": [255, 228, 196],
		"black": [0, 0, 0],
		"blanchedalmond": [255, 235, 205],
		"blue": [0, 0, 255],
		"blueviolet": [138, 43, 226],
		"brown": [165, 42, 42],
		"burlywood": [222, 184, 135],
		"cadetblue": [95, 158, 160],
		"chartreuse": [127, 255, 0],
		"chocolate": [210, 105, 30],
		"coral": [255, 127, 80],
		"cornflowerblue": [100, 149, 237],
		"cornsilk": [255, 248, 220],
		"crimson": [220, 20, 60],
		"cyan": [0, 255, 255],
		"darkblue": [0, 0, 139],
		"darkcyan": [0, 139, 139],
		"darkgoldenrod": [184, 134, 11],
		"darkgray": [169, 169, 169],
		"darkgreen": [0, 100, 0],
		"darkgrey": [169, 169, 169],
		"darkkhaki": [189, 183, 107],
		"darkmagenta": [139, 0, 139],
		"darkolivegreen": [85, 107, 47],
		"darkorange": [255, 140, 0],
		"darkorchid": [153, 50, 204],
		"darkred": [139, 0, 0],
		"darksalmon": [233, 150, 122],
		"darkseagreen": [143, 188, 143],
		"darkslateblue": [72, 61, 139],
		"darkslategray": [47, 79, 79],
		"darkslategrey": [47, 79, 79],
		"darkturquoise": [0, 206, 209],
		"darkviolet": [148, 0, 211],
		"deeppink": [255, 20, 147],
		"deepskyblue": [0, 191, 255],
		"dimgray": [105, 105, 105],
		"dimgrey": [105, 105, 105],
		"dodgerblue": [30, 144, 255],
		"firebrick": [178, 34, 34],
		"floralwhite": [255, 250, 240],
		"forestgreen": [34, 139, 34],
		"fuchsia": [255, 0, 255],
		"gainsboro": [220, 220, 220],
		"ghostwhite": [248, 248, 255],
		"gold": [255, 215, 0],
		"goldenrod": [218, 165, 32],
		"gray": [128, 128, 128],
		"green": [0, 128, 0],
		"greenyellow": [173, 255, 47],
		"grey": [128, 128, 128],
		"honeydew": [240, 255, 240],
		"hotpink": [255, 105, 180],
		"indianred": [205, 92, 92],
		"indigo": [75, 0, 130],
		"ivory": [255, 255, 240],
		"khaki": [240, 230, 140],
		"lavender": [230, 230, 250],
		"lavenderblush": [255, 240, 245],
		"lawngreen": [124, 252, 0],
		"lemonchiffon": [255, 250, 205],
		"lightblue": [173, 216, 230],
		"lightcoral": [240, 128, 128],
		"lightcyan": [224, 255, 255],
		"lightgoldenrodyellow": [250, 250, 210],
		"lightgray": [211, 211, 211],
		"lightgreen": [144, 238, 144],
		"lightgrey": [211, 211, 211],
		"lightpink": [255, 182, 193],
		"lightsalmon": [255, 160, 122],
		"lightseagreen": [32, 178, 170],
		"lightskyblue": [135, 206, 250],
		"lightslategray": [119, 136, 153],
		"lightslategrey": [119, 136, 153],
		"lightsteelblue": [176, 196, 222],
		"lightyellow": [255, 255, 224],
		"lime": [0, 255, 0],
		"limegreen": [50, 205, 50],
		"linen": [250, 240, 230],
		"magenta": [255, 0, 255],
		"maroon": [128, 0, 0],
		"mediumaquamarine": [102, 205, 170],
		"mediumblue": [0, 0, 205],
		"mediumorchid": [186, 85, 211],
		"mediumpurple": [147, 112, 219],
		"mediumseagreen": [60, 179, 113],
		"mediumslateblue": [123, 104, 238],
		"mediumspringgreen": [0, 250, 154],
		"mediumturquoise": [72, 209, 204],
		"mediumvioletred": [199, 21, 133],
		"midnightblue": [25, 25, 112],
		"mintcream": [245, 255, 250],
		"mistyrose": [255, 228, 225],
		"moccasin": [255, 228, 181],
		"navajowhite": [255, 222, 173],
		"navy": [0, 0, 128],
		"oldlace": [253, 245, 230],
		"olive": [128, 128, 0],
		"olivedrab": [107, 142, 35],
		"orange": [255, 165, 0],
		"orangered": [255, 69, 0],
		"orchid": [218, 112, 214],
		"palegoldenrod": [238, 232, 170],
		"palegreen": [152, 251, 152],
		"paleturquoise": [175, 238, 238],
		"palevioletred": [219, 112, 147],
		"papayawhip": [255, 239, 213],
		"peachpuff": [255, 218, 185],
		"peru": [205, 133, 63],
		"pink": [255, 192, 203],
		"plum": [221, 160, 221],
		"powderblue": [176, 224, 230],
		"purple": [128, 0, 128],
		"rebeccapurple": [102, 51, 153],
		"red": [255, 0, 0],
		"rosybrown": [188, 143, 143],
		"royalblue": [65, 105, 225],
		"saddlebrown": [139, 69, 19],
		"salmon": [250, 128, 114],
		"sandybrown": [244, 164, 96],
		"seagreen": [46, 139, 87],
		"seashell": [255, 245, 238],
		"sienna": [160, 82, 45],
		"silver": [192, 192, 192],
		"skyblue": [135, 206, 235],
		"slateblue": [106, 90, 205],
		"slategray": [112, 128, 144],
		"slategrey": [112, 128, 144],
		"snow": [255, 250, 250],
		"springgreen": [0, 255, 127],
		"steelblue": [70, 130, 180],
		"tan": [210, 180, 140],
		"teal": [0, 128, 128],
		"thistle": [216, 191, 216],
		"tomato": [255, 99, 71],
		"turquoise": [64, 224, 208],
		"violet": [238, 130, 238],
		"wheat": [245, 222, 179],
		"white": [255, 255, 255],
		"whitesmoke": [245, 245, 245],
		"yellow": [255, 255, 0],
		"yellowgreen": [154, 205, 50]
	};
	return colorName;
}

/* MIT license */

var conversions;
var hasRequiredConversions;

function requireConversions () {
	if (hasRequiredConversions) return conversions;
	hasRequiredConversions = 1;
	/* eslint-disable no-mixed-operators */
	const cssKeywords = requireColorName();

	// NOTE: conversions should only return primitive values (i.e. arrays, or
	//       values that give correct `typeof` results).
	//       do not use box values types (i.e. Number(), String(), etc.)

	const reverseKeywords = {};
	for (const key of Object.keys(cssKeywords)) {
		reverseKeywords[cssKeywords[key]] = key;
	}

	const convert = {
		rgb: {channels: 3, labels: 'rgb'},
		hsl: {channels: 3, labels: 'hsl'},
		hsv: {channels: 3, labels: 'hsv'},
		hwb: {channels: 3, labels: 'hwb'},
		cmyk: {channels: 4, labels: 'cmyk'},
		xyz: {channels: 3, labels: 'xyz'},
		lab: {channels: 3, labels: 'lab'},
		lch: {channels: 3, labels: 'lch'},
		hex: {channels: 1, labels: ['hex']},
		keyword: {channels: 1, labels: ['keyword']},
		ansi16: {channels: 1, labels: ['ansi16']},
		ansi256: {channels: 1, labels: ['ansi256']},
		hcg: {channels: 3, labels: ['h', 'c', 'g']},
		apple: {channels: 3, labels: ['r16', 'g16', 'b16']},
		gray: {channels: 1, labels: ['gray']}
	};

	conversions = convert;

	// Hide .channels and .labels properties
	for (const model of Object.keys(convert)) {
		if (!('channels' in convert[model])) {
			throw new Error('missing channels property: ' + model);
		}

		if (!('labels' in convert[model])) {
			throw new Error('missing channel labels property: ' + model);
		}

		if (convert[model].labels.length !== convert[model].channels) {
			throw new Error('channel and label counts mismatch: ' + model);
		}

		const {channels, labels} = convert[model];
		delete convert[model].channels;
		delete convert[model].labels;
		Object.defineProperty(convert[model], 'channels', {value: channels});
		Object.defineProperty(convert[model], 'labels', {value: labels});
	}

	convert.rgb.hsl = function (rgb) {
		const r = rgb[0] / 255;
		const g = rgb[1] / 255;
		const b = rgb[2] / 255;
		const min = Math.min(r, g, b);
		const max = Math.max(r, g, b);
		const delta = max - min;
		let h;
		let s;

		if (max === min) {
			h = 0;
		} else if (r === max) {
			h = (g - b) / delta;
		} else if (g === max) {
			h = 2 + (b - r) / delta;
		} else if (b === max) {
			h = 4 + (r - g) / delta;
		}

		h = Math.min(h * 60, 360);

		if (h < 0) {
			h += 360;
		}

		const l = (min + max) / 2;

		if (max === min) {
			s = 0;
		} else if (l <= 0.5) {
			s = delta / (max + min);
		} else {
			s = delta / (2 - max - min);
		}

		return [h, s * 100, l * 100];
	};

	convert.rgb.hsv = function (rgb) {
		let rdif;
		let gdif;
		let bdif;
		let h;
		let s;

		const r = rgb[0] / 255;
		const g = rgb[1] / 255;
		const b = rgb[2] / 255;
		const v = Math.max(r, g, b);
		const diff = v - Math.min(r, g, b);
		const diffc = function (c) {
			return (v - c) / 6 / diff + 1 / 2;
		};

		if (diff === 0) {
			h = 0;
			s = 0;
		} else {
			s = diff / v;
			rdif = diffc(r);
			gdif = diffc(g);
			bdif = diffc(b);

			if (r === v) {
				h = bdif - gdif;
			} else if (g === v) {
				h = (1 / 3) + rdif - bdif;
			} else if (b === v) {
				h = (2 / 3) + gdif - rdif;
			}

			if (h < 0) {
				h += 1;
			} else if (h > 1) {
				h -= 1;
			}
		}

		return [
			h * 360,
			s * 100,
			v * 100
		];
	};

	convert.rgb.hwb = function (rgb) {
		const r = rgb[0];
		const g = rgb[1];
		let b = rgb[2];
		const h = convert.rgb.hsl(rgb)[0];
		const w = 1 / 255 * Math.min(r, Math.min(g, b));

		b = 1 - 1 / 255 * Math.max(r, Math.max(g, b));

		return [h, w * 100, b * 100];
	};

	convert.rgb.cmyk = function (rgb) {
		const r = rgb[0] / 255;
		const g = rgb[1] / 255;
		const b = rgb[2] / 255;

		const k = Math.min(1 - r, 1 - g, 1 - b);
		const c = (1 - r - k) / (1 - k) || 0;
		const m = (1 - g - k) / (1 - k) || 0;
		const y = (1 - b - k) / (1 - k) || 0;

		return [c * 100, m * 100, y * 100, k * 100];
	};

	function comparativeDistance(x, y) {
		/*
			See https://en.m.wikipedia.org/wiki/Euclidean_distance#Squared_Euclidean_distance
		*/
		return (
			((x[0] - y[0]) ** 2) +
			((x[1] - y[1]) ** 2) +
			((x[2] - y[2]) ** 2)
		);
	}

	convert.rgb.keyword = function (rgb) {
		const reversed = reverseKeywords[rgb];
		if (reversed) {
			return reversed;
		}

		let currentClosestDistance = Infinity;
		let currentClosestKeyword;

		for (const keyword of Object.keys(cssKeywords)) {
			const value = cssKeywords[keyword];

			// Compute comparative distance
			const distance = comparativeDistance(rgb, value);

			// Check if its less, if so set as closest
			if (distance < currentClosestDistance) {
				currentClosestDistance = distance;
				currentClosestKeyword = keyword;
			}
		}

		return currentClosestKeyword;
	};

	convert.keyword.rgb = function (keyword) {
		return cssKeywords[keyword];
	};

	convert.rgb.xyz = function (rgb) {
		let r = rgb[0] / 255;
		let g = rgb[1] / 255;
		let b = rgb[2] / 255;

		// Assume sRGB
		r = r > 0.04045 ? (((r + 0.055) / 1.055) ** 2.4) : (r / 12.92);
		g = g > 0.04045 ? (((g + 0.055) / 1.055) ** 2.4) : (g / 12.92);
		b = b > 0.04045 ? (((b + 0.055) / 1.055) ** 2.4) : (b / 12.92);

		const x = (r * 0.4124) + (g * 0.3576) + (b * 0.1805);
		const y = (r * 0.2126) + (g * 0.7152) + (b * 0.0722);
		const z = (r * 0.0193) + (g * 0.1192) + (b * 0.9505);

		return [x * 100, y * 100, z * 100];
	};

	convert.rgb.lab = function (rgb) {
		const xyz = convert.rgb.xyz(rgb);
		let x = xyz[0];
		let y = xyz[1];
		let z = xyz[2];

		x /= 95.047;
		y /= 100;
		z /= 108.883;

		x = x > 0.008856 ? (x ** (1 / 3)) : (7.787 * x) + (16 / 116);
		y = y > 0.008856 ? (y ** (1 / 3)) : (7.787 * y) + (16 / 116);
		z = z > 0.008856 ? (z ** (1 / 3)) : (7.787 * z) + (16 / 116);

		const l = (116 * y) - 16;
		const a = 500 * (x - y);
		const b = 200 * (y - z);

		return [l, a, b];
	};

	convert.hsl.rgb = function (hsl) {
		const h = hsl[0] / 360;
		const s = hsl[1] / 100;
		const l = hsl[2] / 100;
		let t2;
		let t3;
		let val;

		if (s === 0) {
			val = l * 255;
			return [val, val, val];
		}

		if (l < 0.5) {
			t2 = l * (1 + s);
		} else {
			t2 = l + s - l * s;
		}

		const t1 = 2 * l - t2;

		const rgb = [0, 0, 0];
		for (let i = 0; i < 3; i++) {
			t3 = h + 1 / 3 * -(i - 1);
			if (t3 < 0) {
				t3++;
			}

			if (t3 > 1) {
				t3--;
			}

			if (6 * t3 < 1) {
				val = t1 + (t2 - t1) * 6 * t3;
			} else if (2 * t3 < 1) {
				val = t2;
			} else if (3 * t3 < 2) {
				val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
			} else {
				val = t1;
			}

			rgb[i] = val * 255;
		}

		return rgb;
	};

	convert.hsl.hsv = function (hsl) {
		const h = hsl[0];
		let s = hsl[1] / 100;
		let l = hsl[2] / 100;
		let smin = s;
		const lmin = Math.max(l, 0.01);

		l *= 2;
		s *= (l <= 1) ? l : 2 - l;
		smin *= lmin <= 1 ? lmin : 2 - lmin;
		const v = (l + s) / 2;
		const sv = l === 0 ? (2 * smin) / (lmin + smin) : (2 * s) / (l + s);

		return [h, sv * 100, v * 100];
	};

	convert.hsv.rgb = function (hsv) {
		const h = hsv[0] / 60;
		const s = hsv[1] / 100;
		let v = hsv[2] / 100;
		const hi = Math.floor(h) % 6;

		const f = h - Math.floor(h);
		const p = 255 * v * (1 - s);
		const q = 255 * v * (1 - (s * f));
		const t = 255 * v * (1 - (s * (1 - f)));
		v *= 255;

		switch (hi) {
			case 0:
				return [v, t, p];
			case 1:
				return [q, v, p];
			case 2:
				return [p, v, t];
			case 3:
				return [p, q, v];
			case 4:
				return [t, p, v];
			case 5:
				return [v, p, q];
		}
	};

	convert.hsv.hsl = function (hsv) {
		const h = hsv[0];
		const s = hsv[1] / 100;
		const v = hsv[2] / 100;
		const vmin = Math.max(v, 0.01);
		let sl;
		let l;

		l = (2 - s) * v;
		const lmin = (2 - s) * vmin;
		sl = s * vmin;
		sl /= (lmin <= 1) ? lmin : 2 - lmin;
		sl = sl || 0;
		l /= 2;

		return [h, sl * 100, l * 100];
	};

	// http://dev.w3.org/csswg/css-color/#hwb-to-rgb
	convert.hwb.rgb = function (hwb) {
		const h = hwb[0] / 360;
		let wh = hwb[1] / 100;
		let bl = hwb[2] / 100;
		const ratio = wh + bl;
		let f;

		// Wh + bl cant be > 1
		if (ratio > 1) {
			wh /= ratio;
			bl /= ratio;
		}

		const i = Math.floor(6 * h);
		const v = 1 - bl;
		f = 6 * h - i;

		if ((i & 0x01) !== 0) {
			f = 1 - f;
		}

		const n = wh + f * (v - wh); // Linear interpolation

		let r;
		let g;
		let b;
		/* eslint-disable max-statements-per-line,no-multi-spaces */
		switch (i) {
			default:
			case 6:
			case 0: r = v;  g = n;  b = wh; break;
			case 1: r = n;  g = v;  b = wh; break;
			case 2: r = wh; g = v;  b = n; break;
			case 3: r = wh; g = n;  b = v; break;
			case 4: r = n;  g = wh; b = v; break;
			case 5: r = v;  g = wh; b = n; break;
		}
		/* eslint-enable max-statements-per-line,no-multi-spaces */

		return [r * 255, g * 255, b * 255];
	};

	convert.cmyk.rgb = function (cmyk) {
		const c = cmyk[0] / 100;
		const m = cmyk[1] / 100;
		const y = cmyk[2] / 100;
		const k = cmyk[3] / 100;

		const r = 1 - Math.min(1, c * (1 - k) + k);
		const g = 1 - Math.min(1, m * (1 - k) + k);
		const b = 1 - Math.min(1, y * (1 - k) + k);

		return [r * 255, g * 255, b * 255];
	};

	convert.xyz.rgb = function (xyz) {
		const x = xyz[0] / 100;
		const y = xyz[1] / 100;
		const z = xyz[2] / 100;
		let r;
		let g;
		let b;

		r = (x * 3.2406) + (y * -1.5372) + (z * -0.4986);
		g = (x * -0.9689) + (y * 1.8758) + (z * 0.0415);
		b = (x * 0.0557) + (y * -0.2040) + (z * 1.0570);

		// Assume sRGB
		r = r > 0.0031308
			? ((1.055 * (r ** (1.0 / 2.4))) - 0.055)
			: r * 12.92;

		g = g > 0.0031308
			? ((1.055 * (g ** (1.0 / 2.4))) - 0.055)
			: g * 12.92;

		b = b > 0.0031308
			? ((1.055 * (b ** (1.0 / 2.4))) - 0.055)
			: b * 12.92;

		r = Math.min(Math.max(0, r), 1);
		g = Math.min(Math.max(0, g), 1);
		b = Math.min(Math.max(0, b), 1);

		return [r * 255, g * 255, b * 255];
	};

	convert.xyz.lab = function (xyz) {
		let x = xyz[0];
		let y = xyz[1];
		let z = xyz[2];

		x /= 95.047;
		y /= 100;
		z /= 108.883;

		x = x > 0.008856 ? (x ** (1 / 3)) : (7.787 * x) + (16 / 116);
		y = y > 0.008856 ? (y ** (1 / 3)) : (7.787 * y) + (16 / 116);
		z = z > 0.008856 ? (z ** (1 / 3)) : (7.787 * z) + (16 / 116);

		const l = (116 * y) - 16;
		const a = 500 * (x - y);
		const b = 200 * (y - z);

		return [l, a, b];
	};

	convert.lab.xyz = function (lab) {
		const l = lab[0];
		const a = lab[1];
		const b = lab[2];
		let x;
		let y;
		let z;

		y = (l + 16) / 116;
		x = a / 500 + y;
		z = y - b / 200;

		const y2 = y ** 3;
		const x2 = x ** 3;
		const z2 = z ** 3;
		y = y2 > 0.008856 ? y2 : (y - 16 / 116) / 7.787;
		x = x2 > 0.008856 ? x2 : (x - 16 / 116) / 7.787;
		z = z2 > 0.008856 ? z2 : (z - 16 / 116) / 7.787;

		x *= 95.047;
		y *= 100;
		z *= 108.883;

		return [x, y, z];
	};

	convert.lab.lch = function (lab) {
		const l = lab[0];
		const a = lab[1];
		const b = lab[2];
		let h;

		const hr = Math.atan2(b, a);
		h = hr * 360 / 2 / Math.PI;

		if (h < 0) {
			h += 360;
		}

		const c = Math.sqrt(a * a + b * b);

		return [l, c, h];
	};

	convert.lch.lab = function (lch) {
		const l = lch[0];
		const c = lch[1];
		const h = lch[2];

		const hr = h / 360 * 2 * Math.PI;
		const a = c * Math.cos(hr);
		const b = c * Math.sin(hr);

		return [l, a, b];
	};

	convert.rgb.ansi16 = function (args, saturation = null) {
		const [r, g, b] = args;
		let value = saturation === null ? convert.rgb.hsv(args)[2] : saturation; // Hsv -> ansi16 optimization

		value = Math.round(value / 50);

		if (value === 0) {
			return 30;
		}

		let ansi = 30
			+ ((Math.round(b / 255) << 2)
			| (Math.round(g / 255) << 1)
			| Math.round(r / 255));

		if (value === 2) {
			ansi += 60;
		}

		return ansi;
	};

	convert.hsv.ansi16 = function (args) {
		// Optimization here; we already know the value and don't need to get
		// it converted for us.
		return convert.rgb.ansi16(convert.hsv.rgb(args), args[2]);
	};

	convert.rgb.ansi256 = function (args) {
		const r = args[0];
		const g = args[1];
		const b = args[2];

		// We use the extended greyscale palette here, with the exception of
		// black and white. normal palette only has 4 greyscale shades.
		if (r === g && g === b) {
			if (r < 8) {
				return 16;
			}

			if (r > 248) {
				return 231;
			}

			return Math.round(((r - 8) / 247) * 24) + 232;
		}

		const ansi = 16
			+ (36 * Math.round(r / 255 * 5))
			+ (6 * Math.round(g / 255 * 5))
			+ Math.round(b / 255 * 5);

		return ansi;
	};

	convert.ansi16.rgb = function (args) {
		let color = args % 10;

		// Handle greyscale
		if (color === 0 || color === 7) {
			if (args > 50) {
				color += 3.5;
			}

			color = color / 10.5 * 255;

			return [color, color, color];
		}

		const mult = (~~(args > 50) + 1) * 0.5;
		const r = ((color & 1) * mult) * 255;
		const g = (((color >> 1) & 1) * mult) * 255;
		const b = (((color >> 2) & 1) * mult) * 255;

		return [r, g, b];
	};

	convert.ansi256.rgb = function (args) {
		// Handle greyscale
		if (args >= 232) {
			const c = (args - 232) * 10 + 8;
			return [c, c, c];
		}

		args -= 16;

		let rem;
		const r = Math.floor(args / 36) / 5 * 255;
		const g = Math.floor((rem = args % 36) / 6) / 5 * 255;
		const b = (rem % 6) / 5 * 255;

		return [r, g, b];
	};

	convert.rgb.hex = function (args) {
		const integer = ((Math.round(args[0]) & 0xFF) << 16)
			+ ((Math.round(args[1]) & 0xFF) << 8)
			+ (Math.round(args[2]) & 0xFF);

		const string = integer.toString(16).toUpperCase();
		return '000000'.substring(string.length) + string;
	};

	convert.hex.rgb = function (args) {
		const match = args.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
		if (!match) {
			return [0, 0, 0];
		}

		let colorString = match[0];

		if (match[0].length === 3) {
			colorString = colorString.split('').map(char => {
				return char + char;
			}).join('');
		}

		const integer = parseInt(colorString, 16);
		const r = (integer >> 16) & 0xFF;
		const g = (integer >> 8) & 0xFF;
		const b = integer & 0xFF;

		return [r, g, b];
	};

	convert.rgb.hcg = function (rgb) {
		const r = rgb[0] / 255;
		const g = rgb[1] / 255;
		const b = rgb[2] / 255;
		const max = Math.max(Math.max(r, g), b);
		const min = Math.min(Math.min(r, g), b);
		const chroma = (max - min);
		let grayscale;
		let hue;

		if (chroma < 1) {
			grayscale = min / (1 - chroma);
		} else {
			grayscale = 0;
		}

		if (chroma <= 0) {
			hue = 0;
		} else
		if (max === r) {
			hue = ((g - b) / chroma) % 6;
		} else
		if (max === g) {
			hue = 2 + (b - r) / chroma;
		} else {
			hue = 4 + (r - g) / chroma;
		}

		hue /= 6;
		hue %= 1;

		return [hue * 360, chroma * 100, grayscale * 100];
	};

	convert.hsl.hcg = function (hsl) {
		const s = hsl[1] / 100;
		const l = hsl[2] / 100;

		const c = l < 0.5 ? (2.0 * s * l) : (2.0 * s * (1.0 - l));

		let f = 0;
		if (c < 1.0) {
			f = (l - 0.5 * c) / (1.0 - c);
		}

		return [hsl[0], c * 100, f * 100];
	};

	convert.hsv.hcg = function (hsv) {
		const s = hsv[1] / 100;
		const v = hsv[2] / 100;

		const c = s * v;
		let f = 0;

		if (c < 1.0) {
			f = (v - c) / (1 - c);
		}

		return [hsv[0], c * 100, f * 100];
	};

	convert.hcg.rgb = function (hcg) {
		const h = hcg[0] / 360;
		const c = hcg[1] / 100;
		const g = hcg[2] / 100;

		if (c === 0.0) {
			return [g * 255, g * 255, g * 255];
		}

		const pure = [0, 0, 0];
		const hi = (h % 1) * 6;
		const v = hi % 1;
		const w = 1 - v;
		let mg = 0;

		/* eslint-disable max-statements-per-line */
		switch (Math.floor(hi)) {
			case 0:
				pure[0] = 1; pure[1] = v; pure[2] = 0; break;
			case 1:
				pure[0] = w; pure[1] = 1; pure[2] = 0; break;
			case 2:
				pure[0] = 0; pure[1] = 1; pure[2] = v; break;
			case 3:
				pure[0] = 0; pure[1] = w; pure[2] = 1; break;
			case 4:
				pure[0] = v; pure[1] = 0; pure[2] = 1; break;
			default:
				pure[0] = 1; pure[1] = 0; pure[2] = w;
		}
		/* eslint-enable max-statements-per-line */

		mg = (1.0 - c) * g;

		return [
			(c * pure[0] + mg) * 255,
			(c * pure[1] + mg) * 255,
			(c * pure[2] + mg) * 255
		];
	};

	convert.hcg.hsv = function (hcg) {
		const c = hcg[1] / 100;
		const g = hcg[2] / 100;

		const v = c + g * (1.0 - c);
		let f = 0;

		if (v > 0.0) {
			f = c / v;
		}

		return [hcg[0], f * 100, v * 100];
	};

	convert.hcg.hsl = function (hcg) {
		const c = hcg[1] / 100;
		const g = hcg[2] / 100;

		const l = g * (1.0 - c) + 0.5 * c;
		let s = 0;

		if (l > 0.0 && l < 0.5) {
			s = c / (2 * l);
		} else
		if (l >= 0.5 && l < 1.0) {
			s = c / (2 * (1 - l));
		}

		return [hcg[0], s * 100, l * 100];
	};

	convert.hcg.hwb = function (hcg) {
		const c = hcg[1] / 100;
		const g = hcg[2] / 100;
		const v = c + g * (1.0 - c);
		return [hcg[0], (v - c) * 100, (1 - v) * 100];
	};

	convert.hwb.hcg = function (hwb) {
		const w = hwb[1] / 100;
		const b = hwb[2] / 100;
		const v = 1 - b;
		const c = v - w;
		let g = 0;

		if (c < 1) {
			g = (v - c) / (1 - c);
		}

		return [hwb[0], c * 100, g * 100];
	};

	convert.apple.rgb = function (apple) {
		return [(apple[0] / 65535) * 255, (apple[1] / 65535) * 255, (apple[2] / 65535) * 255];
	};

	convert.rgb.apple = function (rgb) {
		return [(rgb[0] / 255) * 65535, (rgb[1] / 255) * 65535, (rgb[2] / 255) * 65535];
	};

	convert.gray.rgb = function (args) {
		return [args[0] / 100 * 255, args[0] / 100 * 255, args[0] / 100 * 255];
	};

	convert.gray.hsl = function (args) {
		return [0, 0, args[0]];
	};

	convert.gray.hsv = convert.gray.hsl;

	convert.gray.hwb = function (gray) {
		return [0, 100, gray[0]];
	};

	convert.gray.cmyk = function (gray) {
		return [0, 0, 0, gray[0]];
	};

	convert.gray.lab = function (gray) {
		return [gray[0], 0, 0];
	};

	convert.gray.hex = function (gray) {
		const val = Math.round(gray[0] / 100 * 255) & 0xFF;
		const integer = (val << 16) + (val << 8) + val;

		const string = integer.toString(16).toUpperCase();
		return '000000'.substring(string.length) + string;
	};

	convert.rgb.gray = function (rgb) {
		const val = (rgb[0] + rgb[1] + rgb[2]) / 3;
		return [val / 255 * 100];
	};
	return conversions;
}

var route;
var hasRequiredRoute;

function requireRoute () {
	if (hasRequiredRoute) return route;
	hasRequiredRoute = 1;
	const conversions = requireConversions();

	/*
		This function routes a model to all other models.

		all functions that are routed have a property `.conversion` attached
		to the returned synthetic function. This property is an array
		of strings, each with the steps in between the 'from' and 'to'
		color models (inclusive).

		conversions that are not possible simply are not included.
	*/

	function buildGraph() {
		const graph = {};
		// https://jsperf.com/object-keys-vs-for-in-with-closure/3
		const models = Object.keys(conversions);

		for (let len = models.length, i = 0; i < len; i++) {
			graph[models[i]] = {
				// http://jsperf.com/1-vs-infinity
				// micro-opt, but this is simple.
				distance: -1,
				parent: null
			};
		}

		return graph;
	}

	// https://en.wikipedia.org/wiki/Breadth-first_search
	function deriveBFS(fromModel) {
		const graph = buildGraph();
		const queue = [fromModel]; // Unshift -> queue -> pop

		graph[fromModel].distance = 0;

		while (queue.length) {
			const current = queue.pop();
			const adjacents = Object.keys(conversions[current]);

			for (let len = adjacents.length, i = 0; i < len; i++) {
				const adjacent = adjacents[i];
				const node = graph[adjacent];

				if (node.distance === -1) {
					node.distance = graph[current].distance + 1;
					node.parent = current;
					queue.unshift(adjacent);
				}
			}
		}

		return graph;
	}

	function link(from, to) {
		return function (args) {
			return to(from(args));
		};
	}

	function wrapConversion(toModel, graph) {
		const path = [graph[toModel].parent, toModel];
		let fn = conversions[graph[toModel].parent][toModel];

		let cur = graph[toModel].parent;
		while (graph[cur].parent) {
			path.unshift(graph[cur].parent);
			fn = link(conversions[graph[cur].parent][cur], fn);
			cur = graph[cur].parent;
		}

		fn.conversion = path;
		return fn;
	}

	route = function (fromModel) {
		const graph = deriveBFS(fromModel);
		const conversion = {};

		const models = Object.keys(graph);
		for (let len = models.length, i = 0; i < len; i++) {
			const toModel = models[i];
			const node = graph[toModel];

			if (node.parent === null) {
				// No possible conversion, or this node is the source model.
				continue;
			}

			conversion[toModel] = wrapConversion(toModel, graph);
		}

		return conversion;
	};
	return route;
}

var colorConvert;
var hasRequiredColorConvert;

function requireColorConvert () {
	if (hasRequiredColorConvert) return colorConvert;
	hasRequiredColorConvert = 1;
	const conversions = requireConversions();
	const route = requireRoute();

	const convert = {};

	const models = Object.keys(conversions);

	function wrapRaw(fn) {
		const wrappedFn = function (...args) {
			const arg0 = args[0];
			if (arg0 === undefined || arg0 === null) {
				return arg0;
			}

			if (arg0.length > 1) {
				args = arg0;
			}

			return fn(args);
		};

		// Preserve .conversion property if there is one
		if ('conversion' in fn) {
			wrappedFn.conversion = fn.conversion;
		}

		return wrappedFn;
	}

	function wrapRounded(fn) {
		const wrappedFn = function (...args) {
			const arg0 = args[0];

			if (arg0 === undefined || arg0 === null) {
				return arg0;
			}

			if (arg0.length > 1) {
				args = arg0;
			}

			const result = fn(args);

			// We're assuming the result is an array here.
			// see notice in conversions.js; don't use box types
			// in conversion functions.
			if (typeof result === 'object') {
				for (let len = result.length, i = 0; i < len; i++) {
					result[i] = Math.round(result[i]);
				}
			}

			return result;
		};

		// Preserve .conversion property if there is one
		if ('conversion' in fn) {
			wrappedFn.conversion = fn.conversion;
		}

		return wrappedFn;
	}

	models.forEach(fromModel => {
		convert[fromModel] = {};

		Object.defineProperty(convert[fromModel], 'channels', {value: conversions[fromModel].channels});
		Object.defineProperty(convert[fromModel], 'labels', {value: conversions[fromModel].labels});

		const routes = route(fromModel);
		const routeModels = Object.keys(routes);

		routeModels.forEach(toModel => {
			const fn = routes[toModel];

			convert[fromModel][toModel] = wrapRounded(fn);
			convert[fromModel][toModel].raw = wrapRaw(fn);
		});
	});

	colorConvert = convert;
	return colorConvert;
}

ansiStyles$1.exports;

(function (module) {

	const wrapAnsi16 = (fn, offset) => (...args) => {
		const code = fn(...args);
		return `\u001B[${code + offset}m`;
	};

	const wrapAnsi256 = (fn, offset) => (...args) => {
		const code = fn(...args);
		return `\u001B[${38 + offset};5;${code}m`;
	};

	const wrapAnsi16m = (fn, offset) => (...args) => {
		const rgb = fn(...args);
		return `\u001B[${38 + offset};2;${rgb[0]};${rgb[1]};${rgb[2]}m`;
	};

	const ansi2ansi = n => n;
	const rgb2rgb = (r, g, b) => [r, g, b];

	const setLazyProperty = (object, property, get) => {
		Object.defineProperty(object, property, {
			get: () => {
				const value = get();

				Object.defineProperty(object, property, {
					value,
					enumerable: true,
					configurable: true
				});

				return value;
			},
			enumerable: true,
			configurable: true
		});
	};

	/** @type {typeof import('color-convert')} */
	let colorConvert;
	const makeDynamicStyles = (wrap, targetSpace, identity, isBackground) => {
		if (colorConvert === undefined) {
			colorConvert = requireColorConvert();
		}

		const offset = isBackground ? 10 : 0;
		const styles = {};

		for (const [sourceSpace, suite] of Object.entries(colorConvert)) {
			const name = sourceSpace === 'ansi16' ? 'ansi' : sourceSpace;
			if (sourceSpace === targetSpace) {
				styles[name] = wrap(identity, offset);
			} else if (typeof suite === 'object') {
				styles[name] = wrap(suite[targetSpace], offset);
			}
		}

		return styles;
	};

	function assembleStyles() {
		const codes = new Map();
		const styles = {
			modifier: {
				reset: [0, 0],
				// 21 isn't widely supported and 22 does the same thing
				bold: [1, 22],
				dim: [2, 22],
				italic: [3, 23],
				underline: [4, 24],
				inverse: [7, 27],
				hidden: [8, 28],
				strikethrough: [9, 29]
			},
			color: {
				black: [30, 39],
				red: [31, 39],
				green: [32, 39],
				yellow: [33, 39],
				blue: [34, 39],
				magenta: [35, 39],
				cyan: [36, 39],
				white: [37, 39],

				// Bright color
				blackBright: [90, 39],
				redBright: [91, 39],
				greenBright: [92, 39],
				yellowBright: [93, 39],
				blueBright: [94, 39],
				magentaBright: [95, 39],
				cyanBright: [96, 39],
				whiteBright: [97, 39]
			},
			bgColor: {
				bgBlack: [40, 49],
				bgRed: [41, 49],
				bgGreen: [42, 49],
				bgYellow: [43, 49],
				bgBlue: [44, 49],
				bgMagenta: [45, 49],
				bgCyan: [46, 49],
				bgWhite: [47, 49],

				// Bright color
				bgBlackBright: [100, 49],
				bgRedBright: [101, 49],
				bgGreenBright: [102, 49],
				bgYellowBright: [103, 49],
				bgBlueBright: [104, 49],
				bgMagentaBright: [105, 49],
				bgCyanBright: [106, 49],
				bgWhiteBright: [107, 49]
			}
		};

		// Alias bright black as gray (and grey)
		styles.color.gray = styles.color.blackBright;
		styles.bgColor.bgGray = styles.bgColor.bgBlackBright;
		styles.color.grey = styles.color.blackBright;
		styles.bgColor.bgGrey = styles.bgColor.bgBlackBright;

		for (const [groupName, group] of Object.entries(styles)) {
			for (const [styleName, style] of Object.entries(group)) {
				styles[styleName] = {
					open: `\u001B[${style[0]}m`,
					close: `\u001B[${style[1]}m`
				};

				group[styleName] = styles[styleName];

				codes.set(style[0], style[1]);
			}

			Object.defineProperty(styles, groupName, {
				value: group,
				enumerable: false
			});
		}

		Object.defineProperty(styles, 'codes', {
			value: codes,
			enumerable: false
		});

		styles.color.close = '\u001B[39m';
		styles.bgColor.close = '\u001B[49m';

		setLazyProperty(styles.color, 'ansi', () => makeDynamicStyles(wrapAnsi16, 'ansi16', ansi2ansi, false));
		setLazyProperty(styles.color, 'ansi256', () => makeDynamicStyles(wrapAnsi256, 'ansi256', ansi2ansi, false));
		setLazyProperty(styles.color, 'ansi16m', () => makeDynamicStyles(wrapAnsi16m, 'rgb', rgb2rgb, false));
		setLazyProperty(styles.bgColor, 'ansi', () => makeDynamicStyles(wrapAnsi16, 'ansi16', ansi2ansi, true));
		setLazyProperty(styles.bgColor, 'ansi256', () => makeDynamicStyles(wrapAnsi256, 'ansi256', ansi2ansi, true));
		setLazyProperty(styles.bgColor, 'ansi16m', () => makeDynamicStyles(wrapAnsi16m, 'rgb', rgb2rgb, true));

		return styles;
	}

	// Make the export immutable
	Object.defineProperty(module, 'exports', {
		enumerable: true,
		get: assembleStyles
	}); 
} (ansiStyles$1));

var ansiStylesExports = ansiStyles$1.exports;

var hasFlag$1 = (flag, argv = process.argv) => {
	const prefix = flag.startsWith('-') ? '' : (flag.length === 1 ? '-' : '--');
	const position = argv.indexOf(prefix + flag);
	const terminatorPosition = argv.indexOf('--');
	return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
};

const os = require$$0;
const tty = require$$1;
const hasFlag = hasFlag$1;

const {env} = process;

let forceColor;
if (hasFlag('no-color') ||
	hasFlag('no-colors') ||
	hasFlag('color=false') ||
	hasFlag('color=never')) {
	forceColor = 0;
} else if (hasFlag('color') ||
	hasFlag('colors') ||
	hasFlag('color=true') ||
	hasFlag('color=always')) {
	forceColor = 1;
}

if ('FORCE_COLOR' in env) {
	if (env.FORCE_COLOR === 'true') {
		forceColor = 1;
	} else if (env.FORCE_COLOR === 'false') {
		forceColor = 0;
	} else {
		forceColor = env.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(env.FORCE_COLOR, 10), 3);
	}
}

function translateLevel(level) {
	if (level === 0) {
		return false;
	}

	return {
		level,
		hasBasic: true,
		has256: level >= 2,
		has16m: level >= 3
	};
}

function supportsColor(haveStream, streamIsTTY) {
	if (forceColor === 0) {
		return 0;
	}

	if (hasFlag('color=16m') ||
		hasFlag('color=full') ||
		hasFlag('color=truecolor')) {
		return 3;
	}

	if (hasFlag('color=256')) {
		return 2;
	}

	if (haveStream && !streamIsTTY && forceColor === undefined) {
		return 0;
	}

	const min = forceColor || 0;

	if (env.TERM === 'dumb') {
		return min;
	}

	if (process.platform === 'win32') {
		// Windows 10 build 10586 is the first Windows release that supports 256 colors.
		// Windows 10 build 14931 is the first release that supports 16m/TrueColor.
		const osRelease = os.release().split('.');
		if (
			Number(osRelease[0]) >= 10 &&
			Number(osRelease[2]) >= 10586
		) {
			return Number(osRelease[2]) >= 14931 ? 3 : 2;
		}

		return 1;
	}

	if ('CI' in env) {
		if (['TRAVIS', 'CIRCLECI', 'APPVEYOR', 'GITLAB_CI', 'GITHUB_ACTIONS', 'BUILDKITE'].some(sign => sign in env) || env.CI_NAME === 'codeship') {
			return 1;
		}

		return min;
	}

	if ('TEAMCITY_VERSION' in env) {
		return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
	}

	if (env.COLORTERM === 'truecolor') {
		return 3;
	}

	if ('TERM_PROGRAM' in env) {
		const version = parseInt((env.TERM_PROGRAM_VERSION || '').split('.')[0], 10);

		switch (env.TERM_PROGRAM) {
			case 'iTerm.app':
				return version >= 3 ? 3 : 2;
			case 'Apple_Terminal':
				return 2;
			// No default
		}
	}

	if (/-256(color)?$/i.test(env.TERM)) {
		return 2;
	}

	if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
		return 1;
	}

	if ('COLORTERM' in env) {
		return 1;
	}

	return min;
}

function getSupportLevel(stream) {
	const level = supportsColor(stream, stream && stream.isTTY);
	return translateLevel(level);
}

var supportsColor_1 = {
	supportsColor: getSupportLevel,
	stdout: translateLevel(supportsColor(true, tty.isatty(1))),
	stderr: translateLevel(supportsColor(true, tty.isatty(2)))
};

const stringReplaceAll$1 = (string, substring, replacer) => {
	let index = string.indexOf(substring);
	if (index === -1) {
		return string;
	}

	const substringLength = substring.length;
	let endIndex = 0;
	let returnValue = '';
	do {
		returnValue += string.substr(endIndex, index - endIndex) + substring + replacer;
		endIndex = index + substringLength;
		index = string.indexOf(substring, endIndex);
	} while (index !== -1);

	returnValue += string.substr(endIndex);
	return returnValue;
};

const stringEncaseCRLFWithFirstIndex$1 = (string, prefix, postfix, index) => {
	let endIndex = 0;
	let returnValue = '';
	do {
		const gotCR = string[index - 1] === '\r';
		returnValue += string.substr(endIndex, (gotCR ? index - 1 : index) - endIndex) + prefix + (gotCR ? '\r\n' : '\n') + postfix;
		endIndex = index + 1;
		index = string.indexOf('\n', endIndex);
	} while (index !== -1);

	returnValue += string.substr(endIndex);
	return returnValue;
};

var util = {
	stringReplaceAll: stringReplaceAll$1,
	stringEncaseCRLFWithFirstIndex: stringEncaseCRLFWithFirstIndex$1
};

var templates;
var hasRequiredTemplates;

function requireTemplates () {
	if (hasRequiredTemplates) return templates;
	hasRequiredTemplates = 1;
	const TEMPLATE_REGEX = /(?:\\(u(?:[a-f\d]{4}|\{[a-f\d]{1,6}\})|x[a-f\d]{2}|.))|(?:\{(~)?(\w+(?:\([^)]*\))?(?:\.\w+(?:\([^)]*\))?)*)(?:[ \t]|(?=\r?\n)))|(\})|((?:.|[\r\n\f])+?)/gi;
	const STYLE_REGEX = /(?:^|\.)(\w+)(?:\(([^)]*)\))?/g;
	const STRING_REGEX = /^(['"])((?:\\.|(?!\1)[^\\])*)\1$/;
	const ESCAPE_REGEX = /\\(u(?:[a-f\d]{4}|{[a-f\d]{1,6}})|x[a-f\d]{2}|.)|([^\\])/gi;

	const ESCAPES = new Map([
		['n', '\n'],
		['r', '\r'],
		['t', '\t'],
		['b', '\b'],
		['f', '\f'],
		['v', '\v'],
		['0', '\0'],
		['\\', '\\'],
		['e', '\u001B'],
		['a', '\u0007']
	]);

	function unescape(c) {
		const u = c[0] === 'u';
		const bracket = c[1] === '{';

		if ((u && !bracket && c.length === 5) || (c[0] === 'x' && c.length === 3)) {
			return String.fromCharCode(parseInt(c.slice(1), 16));
		}

		if (u && bracket) {
			return String.fromCodePoint(parseInt(c.slice(2, -1), 16));
		}

		return ESCAPES.get(c) || c;
	}

	function parseArguments(name, arguments_) {
		const results = [];
		const chunks = arguments_.trim().split(/\s*,\s*/g);
		let matches;

		for (const chunk of chunks) {
			const number = Number(chunk);
			if (!Number.isNaN(number)) {
				results.push(number);
			} else if ((matches = chunk.match(STRING_REGEX))) {
				results.push(matches[2].replace(ESCAPE_REGEX, (m, escape, character) => escape ? unescape(escape) : character));
			} else {
				throw new Error(`Invalid Chalk template style argument: ${chunk} (in style '${name}')`);
			}
		}

		return results;
	}

	function parseStyle(style) {
		STYLE_REGEX.lastIndex = 0;

		const results = [];
		let matches;

		while ((matches = STYLE_REGEX.exec(style)) !== null) {
			const name = matches[1];

			if (matches[2]) {
				const args = parseArguments(name, matches[2]);
				results.push([name].concat(args));
			} else {
				results.push([name]);
			}
		}

		return results;
	}

	function buildStyle(chalk, styles) {
		const enabled = {};

		for (const layer of styles) {
			for (const style of layer.styles) {
				enabled[style[0]] = layer.inverse ? null : style.slice(1);
			}
		}

		let current = chalk;
		for (const [styleName, styles] of Object.entries(enabled)) {
			if (!Array.isArray(styles)) {
				continue;
			}

			if (!(styleName in current)) {
				throw new Error(`Unknown Chalk style: ${styleName}`);
			}

			current = styles.length > 0 ? current[styleName](...styles) : current[styleName];
		}

		return current;
	}

	templates = (chalk, temporary) => {
		const styles = [];
		const chunks = [];
		let chunk = [];

		// eslint-disable-next-line max-params
		temporary.replace(TEMPLATE_REGEX, (m, escapeCharacter, inverse, style, close, character) => {
			if (escapeCharacter) {
				chunk.push(unescape(escapeCharacter));
			} else if (style) {
				const string = chunk.join('');
				chunk = [];
				chunks.push(styles.length === 0 ? string : buildStyle(chalk, styles)(string));
				styles.push({inverse, styles: parseStyle(style)});
			} else if (close) {
				if (styles.length === 0) {
					throw new Error('Found extraneous } in Chalk template literal');
				}

				chunks.push(buildStyle(chalk, styles)(chunk.join('')));
				chunk = [];
				styles.pop();
			} else {
				chunk.push(character);
			}
		});

		chunks.push(chunk.join(''));

		if (styles.length > 0) {
			const errMessage = `Chalk template literal is missing ${styles.length} closing bracket${styles.length === 1 ? '' : 's'} (\`}\`)`;
			throw new Error(errMessage);
		}

		return chunks.join('');
	};
	return templates;
}

const ansiStyles = ansiStylesExports;
const {stdout: stdoutColor, stderr: stderrColor} = supportsColor_1;
const {
	stringReplaceAll,
	stringEncaseCRLFWithFirstIndex
} = util;

const {isArray} = Array;

// `supportsColor.level` → `ansiStyles.color[name]` mapping
const levelMapping = [
	'ansi',
	'ansi',
	'ansi256',
	'ansi16m'
];

const styles = Object.create(null);

const applyOptions = (object, options = {}) => {
	if (options.level && !(Number.isInteger(options.level) && options.level >= 0 && options.level <= 3)) {
		throw new Error('The `level` option should be an integer from 0 to 3');
	}

	// Detect level if not set manually
	const colorLevel = stdoutColor ? stdoutColor.level : 0;
	object.level = options.level === undefined ? colorLevel : options.level;
};

class ChalkClass {
	constructor(options) {
		// eslint-disable-next-line no-constructor-return
		return chalkFactory(options);
	}
}

const chalkFactory = options => {
	const chalk = {};
	applyOptions(chalk, options);

	chalk.template = (...arguments_) => chalkTag(chalk.template, ...arguments_);

	Object.setPrototypeOf(chalk, Chalk.prototype);
	Object.setPrototypeOf(chalk.template, chalk);

	chalk.template.constructor = () => {
		throw new Error('`chalk.constructor()` is deprecated. Use `new chalk.Instance()` instead.');
	};

	chalk.template.Instance = ChalkClass;

	return chalk.template;
};

function Chalk(options) {
	return chalkFactory(options);
}

for (const [styleName, style] of Object.entries(ansiStyles)) {
	styles[styleName] = {
		get() {
			const builder = createBuilder(this, createStyler(style.open, style.close, this._styler), this._isEmpty);
			Object.defineProperty(this, styleName, {value: builder});
			return builder;
		}
	};
}

styles.visible = {
	get() {
		const builder = createBuilder(this, this._styler, true);
		Object.defineProperty(this, 'visible', {value: builder});
		return builder;
	}
};

const usedModels = ['rgb', 'hex', 'keyword', 'hsl', 'hsv', 'hwb', 'ansi', 'ansi256'];

for (const model of usedModels) {
	styles[model] = {
		get() {
			const {level} = this;
			return function (...arguments_) {
				const styler = createStyler(ansiStyles.color[levelMapping[level]][model](...arguments_), ansiStyles.color.close, this._styler);
				return createBuilder(this, styler, this._isEmpty);
			};
		}
	};
}

for (const model of usedModels) {
	const bgModel = 'bg' + model[0].toUpperCase() + model.slice(1);
	styles[bgModel] = {
		get() {
			const {level} = this;
			return function (...arguments_) {
				const styler = createStyler(ansiStyles.bgColor[levelMapping[level]][model](...arguments_), ansiStyles.bgColor.close, this._styler);
				return createBuilder(this, styler, this._isEmpty);
			};
		}
	};
}

const proto = Object.defineProperties(() => {}, {
	...styles,
	level: {
		enumerable: true,
		get() {
			return this._generator.level;
		},
		set(level) {
			this._generator.level = level;
		}
	}
});

const createStyler = (open, close, parent) => {
	let openAll;
	let closeAll;
	if (parent === undefined) {
		openAll = open;
		closeAll = close;
	} else {
		openAll = parent.openAll + open;
		closeAll = close + parent.closeAll;
	}

	return {
		open,
		close,
		openAll,
		closeAll,
		parent
	};
};

const createBuilder = (self, _styler, _isEmpty) => {
	const builder = (...arguments_) => {
		if (isArray(arguments_[0]) && isArray(arguments_[0].raw)) {
			// Called as a template literal, for example: chalk.red`2 + 3 = {bold ${2+3}}`
			return applyStyle(builder, chalkTag(builder, ...arguments_));
		}

		// Single argument is hot path, implicit coercion is faster than anything
		// eslint-disable-next-line no-implicit-coercion
		return applyStyle(builder, (arguments_.length === 1) ? ('' + arguments_[0]) : arguments_.join(' '));
	};

	// We alter the prototype because we must return a function, but there is
	// no way to create a function with a different prototype
	Object.setPrototypeOf(builder, proto);

	builder._generator = self;
	builder._styler = _styler;
	builder._isEmpty = _isEmpty;

	return builder;
};

const applyStyle = (self, string) => {
	if (self.level <= 0 || !string) {
		return self._isEmpty ? '' : string;
	}

	let styler = self._styler;

	if (styler === undefined) {
		return string;
	}

	const {openAll, closeAll} = styler;
	if (string.indexOf('\u001B') !== -1) {
		while (styler !== undefined) {
			// Replace any instances already present with a re-opening code
			// otherwise only the part of the string until said closing code
			// will be colored, and the rest will simply be 'plain'.
			string = stringReplaceAll(string, styler.close, styler.open);

			styler = styler.parent;
		}
	}

	// We can move both next actions out of loop, because remaining actions in loop won't have
	// any/visible effect on parts we add here. Close the styling before a linebreak and reopen
	// after next line to fix a bleed issue on macOS: https://github.com/chalk/chalk/pull/92
	const lfIndex = string.indexOf('\n');
	if (lfIndex !== -1) {
		string = stringEncaseCRLFWithFirstIndex(string, closeAll, openAll, lfIndex);
	}

	return openAll + string + closeAll;
};

let template;
const chalkTag = (chalk, ...strings) => {
	const [firstString] = strings;

	if (!isArray(firstString) || !isArray(firstString.raw)) {
		// If chalk() was called by itself or with a string,
		// return the string itself as a string.
		return strings.join(' ');
	}

	const arguments_ = strings.slice(1);
	const parts = [firstString.raw[0]];

	for (let i = 1; i < firstString.length; i++) {
		parts.push(
			String(arguments_[i - 1]).replace(/[{}\\]/g, '\\$&'),
			String(firstString.raw[i])
		);
	}

	if (template === undefined) {
		template = requireTemplates();
	}

	return template(chalk, parts.join(''));
};

Object.defineProperties(Chalk.prototype, styles);

const chalk = Chalk(); // eslint-disable-line new-cap
chalk.supportsColor = stdoutColor;
chalk.stderr = Chalk({level: stderrColor ? stderrColor.level : 0}); // eslint-disable-line new-cap
chalk.stderr.supportsColor = stderrColor;

var source = chalk;

var chalk$1 = /*@__PURE__*/getDefaultExportFromCjs(source);

/**
 * Sourcemap Locator CLI 工具入口文件
 * 这是编译后的JavaScript版本，用于npm包的bin字段
 */
// 导入编译后的主模块
/**
 * CLI应用程序类
 */
class SourcemapLocatorCLI {
    constructor() {
        this.program = new commander.Command();
        this.setupCommands();
    }
    /**
     * 设置命令行命令
     */
    setupCommands() {
        this.program
            .name("sourcemap-locator")
            .description("A tool for locating original source code positions through multiple layers of sourcemaps")
            .version(this.getVersion());
        // locate命令 - 单个位置定位
        this.program
            .command("locate")
            .description("Locate original source position for a given position in generated code")
            .argument("<sourcemap>", "Path to the sourcemap file")
            .argument("<line>", "Line number (1-based)", this.parseInteger)
            .argument("<column>", "Column number (0-based)", this.parseInteger)
            .option("-r, --recursive", "Enable recursive sourcemap resolution", true)
            .option("-d, --max-depth <depth>", "Maximum recursion depth", this.parseInteger, 10)
            .option("-v, --verbose", "Enable verbose output", false)
            .option("--format <format>", "Output format (json|table|simple)", "table")
            .action(this.handleLocateCommand.bind(this));
        // validate命令 - 验证sourcemap文件
        this.program
            .command("validate")
            .description("Validate sourcemap file format and structure")
            .argument("<sourcemap>", "Path to the sourcemap file")
            .option("-v, --verbose", "Enable verbose output", false)
            .action(this.handleValidateCommand.bind(this));
    }
    /**
     * 处理locate命令
     */
    async handleLocateCommand(sourcemap, line, column, options) {
        try {
            const sourcemapPath = path.resolve(sourcemap);
            if (!fs.existsSync(sourcemapPath)) {
                this.error(`Sourcemap file not found: ${sourcemapPath}`);
                return;
            }
            const locator = new RecursiveLocator({
                maxRecursionDepth: options.maxDepth || 10,
            });
            const result = await locator.locateRecursively({
                sourcemapPath,
                line,
                column
            });
            if (result.success && result.result) {
                this.outputLocateResult(result, options.format);
            }
            else {
                this.error(`Failed to locate position: ${result.error}`);
            }
            locator.destroy();
        }
        catch (error) {
            this.error(`Unexpected error: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    /**
     * 处理validate命令
     */
    async handleValidateCommand(sourcemap) {
        try {
            const sourcemapPath = path.resolve(sourcemap);
            if (!fs.existsSync(sourcemapPath)) {
                this.error(`Sourcemap file not found: ${sourcemapPath}`);
                return;
            }
            const parser = new SourcemapParser();
            try {
                const consumer = await parser.parseSourcemap(sourcemapPath);
                consumer.destroy();
                console.log(chalk$1.green("✓ Sourcemap file is valid"));
            }
            catch (error) {
                this.error(`Invalid sourcemap file: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
            parser.destroy();
        }
        catch (error) {
            this.error(`Invalid sourcemap: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    /**
     * 输出单个定位结果
     */
    outputLocateResult(result, format) {
        const location = result.result;
        if (!location) {
            console.error(chalk$1.red("No location result found"));
            return;
        }
        switch (format) {
            case "json":
                console.log(JSON.stringify(result, null, 2));
                break;
            case "simple":
                console.log(`${location.sourceFile}:${location.sourceLine}:${location.sourceColumn}`);
                break;
            case "table":
            default:
                console.log(chalk$1.bold("Location Result:"));
                console.log(`Source File: ${chalk$1.cyan(location.sourceFile)}`);
                console.log(`Line: ${chalk$1.yellow(location.sourceLine)}`);
                console.log(`Column: ${chalk$1.yellow(location.sourceColumn)}`);
                if (location.mappingSteps && location.mappingSteps.length > 0) {
                    console.log(chalk$1.bold("\nMapping Chain:"));
                    location.mappingSteps.forEach((step, index) => {
                        console.log(`  ${index + 1}. (${step.inputPosition.line},${step.inputPosition.column}) → (${step.outputPosition.line},${step.outputPosition.column}) in ${step.sourceFile.split("/").pop()}`);
                    });
                }
                break;
        }
    }
    /**
     * 解析整数参数
     */
    parseInteger(value) {
        const parsed = parseInt(value, 10);
        if (isNaN(parsed)) {
            throw new Error(`Invalid number: ${value}`);
        }
        return parsed;
    }
    /**
     * 获取版本号
     */
    getVersion() {
        try {
            const packagePath = path.resolve(__dirname, "../package.json");
            const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf-8"));
            return packageJson.version || "1.0.0";
        }
        catch {
            return "1.0.0";
        }
    }
    /**
     * 输出错误信息并退出
     */
    error(message) {
        console.error(chalk$1.red("Error:"), message);
        process.exit(1);
    }
    /**
     * 运行CLI应用程序
     */
    run() {
        this.program.parse();
    }
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
exports.SourcemapLocatorCLI = SourcemapLocatorCLI;
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
