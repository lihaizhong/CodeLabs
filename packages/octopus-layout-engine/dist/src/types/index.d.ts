/**
 * 布局节点类型
 */
export declare enum NodeType {
    TEXT = "text",
    IMAGE = "image",
    CONTAINER = "container"
}
/**
 * 文本对齐方式
 */
export declare enum TextAlign {
    LEFT = "left",
    CENTER = "center",
    RIGHT = "right",
    JUSTIFY = "justify"
}
/**
 * 垂直对齐方式
 */
export declare enum VerticalAlign {
    TOP = "top",
    MIDDLE = "middle",
    BOTTOM = "bottom"
}
/**
 * Flex主轴方向
 */
export declare enum FlexDirection {
    ROW = "row",
    ROW_REVERSE = "row-reverse",
    COLUMN = "column",
    COLUMN_REVERSE = "column-reverse"
}
/**
 * Flex主轴对齐方式
 */
export declare enum JustifyContent {
    FLEX_START = "flex-start",
    FLEX_END = "flex-end",
    CENTER = "center",
    SPACE_BETWEEN = "space-between",
    SPACE_AROUND = "space-around",
    SPACE_EVENLY = "space-evenly"
}
/**
 * Flex交叉轴对齐方式
 */
export declare enum AlignItems {
    FLEX_START = "flex-start",
    FLEX_END = "flex-end",
    CENTER = "center",
    STRETCH = "stretch",
    BASELINE = "baseline"
}
/**
 * Flex换行方式
 */
export declare enum FlexWrap {
    NOWRAP = "nowrap",
    WRAP = "wrap",
    WRAP_REVERSE = "wrap-reverse"
}
/**
 * 布局节点样式接口
 */
export interface NodeStyle {
    width?: number;
    height?: number;
    marginTop?: number;
    marginRight?: number;
    marginBottom?: number;
    marginLeft?: number;
    paddingTop?: number;
    paddingRight?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    textAlign?: TextAlign;
    verticalAlign?: VerticalAlign;
    fontFamily?: string;
    fontSize?: number;
    lineHeight?: number;
    color?: string;
    backgroundColor?: string;
    display?: 'flex' | 'block';
    flexDirection?: FlexDirection;
    justifyContent?: JustifyContent;
    alignItems?: AlignItems;
    flexWrap?: FlexWrap;
    flexGrow?: number;
    flexShrink?: number;
    flexBasis?: number | 'auto';
}
/**
 * 布局节点位置和尺寸
 */
export interface NodeRect {
    x: number;
    y: number;
    width: number;
    height: number;
}
/**
 * 文本测量结果
 */
export interface TextMetrics {
    width: number;
    height: number;
    lines: string[];
}
/**
 * 布局上下文配置
 */
export interface LayoutContextOptions {
    width: number;
    height: number;
    devicePixelRatio?: number;
}
/**
 * 布局节点配置
 */
export interface LayoutNodeOptions {
    id?: string;
    type: NodeType;
    content?: string;
    style?: NodeStyle;
    children?: LayoutNodeOptions[];
}
