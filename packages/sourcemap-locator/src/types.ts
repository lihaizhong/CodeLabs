/**
 * Sourcemap定位器核心类型定义
 * 定义了所有用于sourcemap解析和位置定位的数据结构
 */

/**
 * 源码位置信息
 * 表示定位到的最终源码位置
 */
export interface SourceLocation {
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
export interface MappingStep {
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
export interface LocationRequest {
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
export interface LocateResult {
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
export interface BatchLocationRequest {
  /** 批量定位请求列表 */
  locations: LocationRequest[];
}

/**
 * 批量定位结果
 * 包含批量定位操作的完整结果
 */
export interface BatchLocateResult {
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
export interface SourceMapData {
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
    offset: { line: number; column: number };
    map: SourceMapData;
  }>;
}

/**
 * 缓存配置
 * 用于配置sourcemap解析缓存
 */
export interface CacheConfig {
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
export interface CLIOptions {
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
export interface ParserConfig {
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
export interface ParseContext {
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
export enum ErrorType {
  /** 文件不存在 */
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  /** 无效的sourcemap格式 */
  INVALID_SOURCEMAP = 'INVALID_SOURCEMAP',
  /** 位置超出范围 */
  POSITION_OUT_OF_RANGE = 'POSITION_OUT_OF_RANGE',
  /** 递归深度超限 */
  MAX_RECURSION_EXCEEDED = 'MAX_RECURSION_EXCEEDED',
  /** 最大深度超限 */
  MAX_DEPTH_EXCEEDED = 'MAX_DEPTH_EXCEEDED',
  /** 循环引用 */
  CIRCULAR_REFERENCE = 'CIRCULAR_REFERENCE',
  /** 解析错误 */
  PARSE_ERROR = 'PARSE_ERROR'
}

/**
 * 自定义错误类
 * 用于表示sourcemap定位过程中的错误
 */
export class SourcemapLocatorError extends Error {
  public readonly type: ErrorType;
  public readonly details?: any;

  constructor(type: ErrorType, message: string, details?: any) {
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
export enum EventType {
  /** 开始解析 */
  PARSE_START = 'PARSE_START',
  /** 解析完成 */
  PARSE_COMPLETE = 'PARSE_COMPLETE',
  /** 找到映射 */
  MAPPING_FOUND = 'MAPPING_FOUND',
  /** 递归解析 */
  RECURSIVE_PARSE = 'RECURSIVE_PARSE',
  /** 缓存命中 */
  CACHE_HIT = 'CACHE_HIT',
  /** 缓存未命中 */
  CACHE_MISS = 'CACHE_MISS',
  /** 开始定位 */
  LOCATE_START = 'locate_start',
  /** 步骤完成 */
  STEP_COMPLETE = 'step_complete',
  /** 定位完成 */
  LOCATE_COMPLETE = 'locate_complete'
}

/**
 * 事件数据接口
 * 定义事件携带的数据结构
 */
export interface EventData {
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
export type EventListener = (event: EventData) => void;