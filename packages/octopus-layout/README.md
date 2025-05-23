# Octopus Layout

一个基于 CSS 属性的 Canvas 2D 文字布局引擎，专门针对文字内容的布局和渲染。

## 特性

- 🎨 **CSS 样式支持** - 支持类似 CSS 的文字样式属性
- 📝 **文字布局** - 专门优化的文字排版和布局算法
- 🔧 **盒模型** - 完整的 padding、margin、border 支持
- 📱 **响应式** - 支持动态调整布局适应不同尺寸
- 🎯 **交互支持** - 提供位置检测和节点查找功能
- 🚀 **高性能** - 基于 Canvas 2D 的高效渲染

## 安装

```bash
npm install octopus-layout
```

## 基础用法

```typescript
import CanvasLayoutEngine, { createTextNode, createContainerNode } from 'octopus-layout';

// 创建 Canvas 元素
const canvas = document.createElement('canvas');
canvas.width = 800;
canvas.height = 600;
document.body.appendChild(canvas);

// 初始化布局引擎
const engine = new CanvasLayoutEngine(canvas, {
  containerWidth: 800,
  containerHeight: 600,
  defaultFontSize: 14,
  defaultFontFamily: 'Arial, sans-serif',
  defaultLineHeight: 1.4
});

// 创建布局树
const layout = createContainerNode([
  createTextNode('标题文字', {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center'
  }),
  
  createTextNode('这是一段正文内容，支持自动换行和各种文字样式。', {
    fontSize: 16,
    lineHeight: 1.6,
    color: '#666666'
  }, {
    padding: { top: 20, left: 20, right: 20 }
  })
]);

// 渲染布局
engine.render(layout);
```

## API 文档

### CanvasLayoutEngine

主要的布局引擎类。

#### 构造函数

```typescript
new CanvasLayoutEngine(canvas: HTMLCanvasElement, options: LayoutOptions)
```

**参数：**
- `canvas` - Canvas 元素
- `options` - 布局选项

#### 方法

##### render(layoutTree: LayoutNode): void

渲染布局树到 Canvas。

##### getNodeAt(x: number, y: number, node: LayoutNode): LayoutNode | null

获取指定坐标位置的节点，用于交互处理。

### 接口定义

#### TextStyle

文字样式接口：

```typescript
interface TextStyle {
  fontSize?: number;              // 字体大小
  fontFamily?: string;            // 字体族
  fontWeight?: string | number;   // 字体粗细
  color?: string;                 // 文字颜色
  lineHeight?: number;            // 行高
  textAlign?: 'left' | 'center' | 'right' | 'justify';  // 文字对齐
  textDecoration?: 'none' | 'underline' | 'line-through';  // 文字装饰
  letterSpacing?: number;         // 字母间距
  wordSpacing?: number;           // 单词间距
}
```

#### BoxModel

盒模型接口：

```typescript
interface BoxModel {
  width?: number;     // 宽度
  height?: number;    // 高度
  padding?: {         // 内边距
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  margin?: {          // 外边距
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  border?: {          // 边框
    width?: number;
    color?: string;
    style?: 'solid' | 'dashed' | 'dotted';
  };
}
```

#### LayoutNode

布局节点接口：

```typescript
interface LayoutNode {
  id?: string;                    // 节点ID
  type: 'text' | 'container';     // 节点类型
  content?: string;               // 文字内容（仅文字节点）
  style?: TextStyle;              // 文字样式
  box?: BoxModel;                 // 盒模型
  children?: LayoutNode[];        // 子节点（仅容器节点）
  x?: number;                     // 计算后的X坐标
  y?: number;                     // 计算后的Y坐标
  computedWidth?: number;         // 计算后的宽度
  computedHeight?: number;        // 计算后的高度
}
```

### 辅助函数

#### createTextNode

创建文字节点：

```typescript
function createTextNode(
  content: string, 
  style?: TextStyle, 
  box?: BoxModel
): LayoutNode
```

#### createContainerNode

创建容器节点：

```typescript
function createContainerNode(
  children: LayoutNode[], 
  box?: BoxModel
): LayoutNode
```

## 高级用法

### 响应式布局

```typescript
function createResponsiveLayout(width: number): LayoutNode {
  const isMobile = width < 600;
  
  return createContainerNode([
    createTextNode('响应式标题', {
      fontSize: isMobile ? 18 : 24,
      textAlign: 'center'
    }),
    
    createTextNode('内容会根据屏幕尺寸调整', {
      fontSize: isMobile ? 12 : 16,
      lineHeight: isMobile ? 1.4 : 1.6
    }, {
      padding: { 
        left: isMobile ? 10 : 20, 
        right: isMobile ? 10 : 20 
      }
    })
  ]);
}
```

### 交互处理

```typescript
// 添加点击事件处理
canvas.addEventListener('click', (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  
  const clickedNode = engine.getNodeAt(x, y, layout);
  if (clickedNode) {
    console.log('点击了节点:', clickedNode);
  }
});
```

### 动态更新

```typescript
// 更新文字内容
function updateContent(node: LayoutNode, newContent: string) {
  if (node.type === 'text') {
    node.content = newContent;
    engine.render(layout);  // 重新渲染
  }
}

// 更新样式
function updateStyle(node: LayoutNode, newStyle: Partial<TextStyle>) {
  node.style = { ...node.style, ...newStyle };
  engine.render(layout);
}
```

## 示例

查看 `src/example.ts` 文件获取更多使用示例。

## 许可证

MIT License