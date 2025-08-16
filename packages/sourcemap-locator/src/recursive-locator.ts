/**
 * 递归定位器
 * 支持多层sourcemap的循环解析，直到找到最终的原始源码位置
 */

import { resolve, dirname } from 'path';
import { readFileSync, existsSync } from 'fs';
import { SourcemapParser } from './parser';
import {
  SourceLocation,
  LocationRequest,
  LocateResult,
  MappingStep,
  BatchLocationRequest,
  BatchLocateResult,
  ParserConfig,
  ErrorType,
  SourcemapLocatorError,
  EventType,
  EventData,
  EventListener
} from './types';

/**
 * 递归定位器类
 * 提供多层sourcemap的递归解析功能
 */
export class RecursiveLocator {
  private parser: SourcemapParser;
  private maxDepth: number;
  private visitedFiles: Set<string> = new Set();
  private listeners: Map<EventType, EventListener[]> = new Map();

  /**
   * 构造函数
   * @param config 解析器配置
   */
  constructor(config: ParserConfig = {}) {
    this.parser = new SourcemapParser(config);
    this.maxDepth = config.maxRecursionDepth || 10;
  }

  /**
   * 递归定位源码位置
   * @param request 定位请求
   * @returns 定位结果，包含完整的映射链
   */
  public async locateRecursively(request: LocationRequest): Promise<LocateResult> {
    this.visitedFiles.clear();
    const mappingSteps: MappingStep[] = [];
    
    // 触发定位开始事件
    this.emitEvent(EventType.LOCATE_START, {
      sourcemapPath: request.sourcemapPath,
      line: request.line,
      column: request.column
    });
    
    try {
      const result = await this.locateWithDepth(
        request.sourcemapPath,
        request.line,
        request.column,
        0,
        mappingSteps
      );

      if (result) {
        // 触发定位完成事件
        this.emitEvent(EventType.LOCATE_COMPLETE, {
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
      } else {
        // 触发定位完成事件（失败）
        this.emitEvent(EventType.LOCATE_COMPLETE, {
          success: false,
          error: `No mapping found for position (${request.line}, ${request.column})`
        });
        
        return {
          success: false,
          error: `No mapping found for position (${request.line}, ${request.column})`
        };
      }
    } catch (error) {
      const errorMessage = error instanceof SourcemapLocatorError ? error.message : 
        `Unexpected error: ${error instanceof Error ? error.message : String(error)}`;
      
      // 触发定位完成事件（错误）
      this.emitEvent(EventType.LOCATE_COMPLETE, {
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
  private async locateWithDepth(
    sourcemapPath: string,
    line: number,
    column: number,
    depth: number,
    mappingSteps: MappingStep[]
  ): Promise<SourceLocation | null> {
    // 检查递归深度限制
    if (depth >= this.maxDepth) {
      throw new SourcemapLocatorError(
        ErrorType.MAX_DEPTH_EXCEEDED,
        `Maximum recursion depth (${this.maxDepth}) exceeded`
      );
    }

    // 检查循环引用
    const normalizedPath = resolve(sourcemapPath);
    if (this.visitedFiles.has(normalizedPath)) {
      throw new SourcemapLocatorError(
        ErrorType.CIRCULAR_REFERENCE,
        `Circular reference detected: ${normalizedPath}`
      );
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
    const mappingStep: MappingStep = {
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
    this.emitEvent(EventType.STEP_COMPLETE, {
      step: mappingStep,
      depth,
      totalSteps: mappingSteps.length
    });

    // 检查是否还有更深层的sourcemap
    const nextSourcemapPath = await this.findNextSourcemap(currentResult.sourceFile);
    
    if (nextSourcemapPath && existsSync(nextSourcemapPath)) {
      // 继续递归解析
      const deeperResult = await this.locateWithDepth(
        nextSourcemapPath,
        currentResult.sourceLine,
        currentResult.sourceColumn,
        depth + 1,
        mappingSteps
      );

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
  private async findNextSourcemap(sourceFile: string): Promise<string | null> {
    // 首先尝试从文件内容中提取 sourcemap 引用
    const extractedPath = await this.extractSourcemapFromFile(sourceFile);
    
    if (extractedPath) {
      const resolvedPath = resolve(dirname(sourceFile), extractedPath);
      return resolvedPath;
    }

    // 如果没有找到引用，尝试常见的命名模式
    const baseName = sourceFile.split('/').pop()?.replace(/\.[^.]+$/, '') || '';
    const dir = dirname(sourceFile);
    
    const patterns = [
      `${baseName}.js.map`,
      `${baseName}.map`,
      `${baseName}.ts.map`,
      `${baseName}.jsx.map`,
      `${baseName}.tsx.map`
    ];
    
    for (const pattern of patterns) {
      const fullPath = resolve(dir, pattern);
      if (existsSync(fullPath)) {
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
  private extractSourcemapFromFile(sourceFile: string): string | null {
    try {
      // 只处理JavaScript相关文件
      if (!/\.(js|jsx|ts|tsx)$/.test(sourceFile)) {
        return null;
      }

      if (!existsSync(sourceFile)) {
        return null;
      }

      const content = readFileSync(sourceFile, 'utf-8');
      
      // 查找sourcemap引用注释
      const sourcemapRegex = /\/\/#\s*sourceMappingURL=(.+)$/m;
      const match = content.match(sourcemapRegex);
      
      if (match && match[1]) {
        const sourcemapUrl = match[1].trim();
        
        // 如果是相对路径，解析为绝对路径
        if (!sourcemapUrl.startsWith('http')) {
          const sourceDir = dirname(sourceFile);
          const sourcemapPath = resolve(sourceDir, sourcemapUrl);
          
          if (existsSync(sourcemapPath)) {
            return sourcemapPath;
          }
        }
      }
      
      return null;
    } catch (error) {
      // 读取文件失败，返回null
      return null;
    }
  }

  /**
   * 批量递归定位
   * @param request 批量定位请求
   * @returns 批量定位结果
   */
  public async batchLocateRecursively(request: BatchLocationRequest): Promise<BatchLocateResult> {
    const results: LocateResult[] = [];
    const errors: string[] = [];

    for (const locationRequest of request.locations) {
      try {
        const result = await this.locateRecursively(locationRequest);
        results.push(result);
        
        if (!result.success) {
          errors.push(`${locationRequest.sourcemapPath}:${locationRequest.line}:${locationRequest.column} - ${result.error}`);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        const failedResult: LocateResult = {
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
  public getMappingChainSummary(mappingSteps: MappingStep[]): string {
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
  private emitEvent(eventType: EventType, data?: any): void {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      const event: EventData = {
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
  public addEventListener(eventType: EventType, listener: (event: any) => void): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(listener);
    
    // 同时添加到parser的监听器中
    this.parser.addEventListener(eventType, listener);
  }

  /**
   * 移除事件监听器
   * @param eventType 事件类型
   * @param listener 监听器函数
   */
  public removeEventListener(eventType: EventType, listener: (event: any) => void): void {
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
  public clearCache(): void {
    this.parser.clearCache();
    this.visitedFiles.clear();
  }

  /**
   * 销毁定位器
   */
  public destroy(): void {
    this.parser.destroy();
    this.visitedFiles.clear();
  }
}

/**
 * 创建递归定位器实例
 * @param config 解析器配置
 * @returns 递归定位器实例
 */
export function createRecursiveLocator(config?: ParserConfig): RecursiveLocator {
  return new RecursiveLocator(config);
}