/**
 * 布局节点类型
 */
export enum NodeType {
  TEXT = 'text',
  IMAGE = 'image',
  CONTAINER = 'container',
}

/**
 * 文本对齐方式
 */
export enum TextAlign {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
  JUSTIFY = 'justify',
}

/**
 * 垂直对齐方式
 */
export enum VerticalAlign {
  TOP = 'top',
  MIDDLE = 'middle',
  BOTTOM = 'bottom',
}

/**
 * Flex主轴方向
 */
export enum FlexDirection {
  ROW = 'row',
  ROW_REVERSE = 'row-reverse',
  COLUMN = 'column',
  COLUMN_REVERSE = 'column-reverse',
}

/**
 * Flex主轴对齐方式
 */
export enum JustifyContent {
  FLEX_START = 'flex-start',
  FLEX_END = 'flex-end',
  CENTER = 'center',
  SPACE_BETWEEN = 'space-between',
  SPACE_AROUND = 'space-around',
  SPACE_EVENLY = 'space-evenly',
}

/**
 * Flex交叉轴对齐方式
 */
export enum AlignItems {
  FLEX_START = 'flex-start',
  FLEX_END = 'flex-end',
  CENTER = 'center',
  STRETCH = 'stretch',
  BASELINE = 'baseline',
}

/**
 * Flex换行方式
 */
export enum FlexWrap {
  NOWRAP = 'nowrap',
  WRAP = 'wrap',
  WRAP_REVERSE = 'wrap-reverse',
}

/**
 * 布局节点样式接口
 */
export interface NodeStyle {
  // 布局相关属性
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
  // 文本相关属性
  textAlign?: TextAlign;
  verticalAlign?: VerticalAlign;
  fontFamily?: string;
  fontSize?: number;
  lineHeight?: number;
  color?: string;
  backgroundColor?: string;
  // Flex相关属性
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
 * 布局节点配置
 */
export interface LayoutNodeOptions {
  type: NodeType;
  content?: string;
  style?: NodeStyle;
  children?: LayoutNodeOptions[];
}