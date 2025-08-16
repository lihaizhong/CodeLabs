/**
 * Sourcemap定位器主入口文件
 * 提供统一的API接口供外部程序调用
 */
export * from './types';
export * from './parser';
export * from './recursive-locator';
import { promises as fs } from 'fs';
import { RecursiveLocator } from './recursive-locator';
import { SourcemapParser } from './parser';
/**
 * Sourcemap定位器API类
 * 提供高级API接口，封装常用功能
 */
export class SourcemapLocatorAPI {
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
        const rawSourceMap = JSON.parse(await fs.readFile(sourcemapPath, 'utf-8'));
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
export function createLocator(config) {
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
export async function locate(sourcemapPath, line, column, config) {
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
export async function batchLocate(requests, config) {
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
export async function validateSourcemap(sourcemapPath, config) {
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
export async function getSourcemapInfo(sourcemapPath, config) {
    const api = new SourcemapLocatorAPI(config);
    try {
        return await api.getSourcemapInfo(sourcemapPath);
    }
    finally {
        api.destroy();
    }
}
// 默认导出
export default SourcemapLocatorAPI;
//# sourceMappingURL=index.js.map