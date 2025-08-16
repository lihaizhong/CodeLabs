/**
 * Sourcemap定位器核心类型定义
 * 定义了所有用于sourcemap解析和位置定位的数据结构
 */
/**
 * 错误类型枚举
 * 定义可能出现的错误类型
 */
export var ErrorType;
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
})(ErrorType || (ErrorType = {}));
/**
 * 自定义错误类
 * 用于表示sourcemap定位过程中的错误
 */
export class SourcemapLocatorError extends Error {
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
export var EventType;
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
})(EventType || (EventType = {}));
//# sourceMappingURL=types.js.map