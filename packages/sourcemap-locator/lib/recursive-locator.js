"use strict";
/**
 * 递归定位器
 * 支持多层sourcemap的循环解析，直到找到最终的原始源码位置
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecursiveLocator = void 0;
exports.createRecursiveLocator = createRecursiveLocator;
const path_1 = require("path");
const fs_1 = require("fs");
const parser_1 = require("./parser");
const types_1 = require("./types");
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
        this.parser = new parser_1.SourcemapParser(config);
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
        try {
            const result = await this.locateWithDepth(request.sourcemapPath, request.line, request.column, 0, mappingSteps);
            if (result) {
                return {
                    success: true,
                    result: {
                        ...result,
                        mappingSteps
                    }
                };
            }
            else {
                return {
                    success: false,
                    error: `No mapping found for position (${request.line}, ${request.column})`
                };
            }
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
            throw new types_1.SourcemapLocatorError(types_1.ErrorType.MAX_DEPTH_EXCEEDED, `Maximum recursion depth (${this.maxDepth}) exceeded`);
        }
        // 检查循环引用
        const normalizedPath = (0, path_1.resolve)(sourcemapPath);
        if (this.visitedFiles.has(normalizedPath)) {
            throw new types_1.SourcemapLocatorError(types_1.ErrorType.CIRCULAR_REFERENCE, `Circular reference detected: ${normalizedPath}`);
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
        // 检查是否还有更深层的sourcemap
        const nextSourcemapPath = this.findNextSourcemap(currentResult.sourceFile);
        if (nextSourcemapPath && (0, fs_1.existsSync)(nextSourcemapPath)) {
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
    findNextSourcemap(sourceFile) {
        const possibleExtensions = ['.map', '.js.map', '.ts.map', '.jsx.map', '.tsx.map'];
        const sourceDir = (0, path_1.dirname)(sourceFile);
        const sourceBasename = sourceFile;
        // 尝试不同的sourcemap文件命名模式
        const patterns = [
            // 直接在源文件后加.map
            `${sourceFile}.map`,
            // 替换扩展名为.map
            sourceFile.replace(/\.[^.]+$/, '.map'),
            // 在同目录下查找同名的.map文件
            (0, path_1.join)(sourceDir, `${sourceBasename}.map`)
        ];
        for (const pattern of patterns) {
            if ((0, fs_1.existsSync)(pattern)) {
                return pattern;
            }
        }
        // 尝试常见的构建工具生成的sourcemap文件
        const filename = sourceFile.split('/').pop() || '';
        const nameWithoutExt = filename.replace(/\.[^.]+$/, '');
        for (const ext of possibleExtensions) {
            const mapFile = (0, path_1.join)(sourceDir, `${nameWithoutExt}${ext}`);
            if ((0, fs_1.existsSync)(mapFile)) {
                return mapFile;
            }
        }
        return null;
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
     * 添加事件监听器
     * @param eventType 事件类型
     * @param listener 监听器函数
     */
    addEventListener(eventType, listener) {
        this.parser.addEventListener(eventType, listener);
    }
    /**
     * 移除事件监听器
     * @param eventType 事件类型
     * @param listener 监听器函数
     */
    removeEventListener(eventType, listener) {
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
exports.RecursiveLocator = RecursiveLocator;
/**
 * 创建递归定位器实例
 * @param config 解析器配置
 * @returns 递归定位器实例
 */
function createRecursiveLocator(config) {
    return new RecursiveLocator(config);
}
//# sourceMappingURL=recursive-locator.js.map