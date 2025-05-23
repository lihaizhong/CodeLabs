/**
 * Octopus Layout 使用示例
 * 展示如何使用基于 CSS 属性的 Canvas 布局系统
 */

import CanvasLayoutEngine, { createTextNode, createContainerNode, LayoutNode } from '../src/index';

/**
 * 创建示例布局
 */
export function createExampleLayout() {
  return createContainerNode([
    // 标题
    createTextNode('Canvas 文字布局系统', {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#333333',
      textAlign: 'center'
    }, {
      padding: { top: 20, bottom: 10 },
      border: { width: 2, color: '#cccccc', style: 'solid' }
    }),

    // 副标题
    createTextNode('基于 CSS 属性的文字渲染引擎', {
      fontSize: 16,
      color: '#666666',
      textAlign: 'center'
    }, {
      padding: { top: 10, bottom: 20 }
    }),

    // 内容容器
    createContainerNode([
      // 段落1
      createTextNode('这是一个功能强大的 Canvas 2D 文字布局系统，支持类似 CSS 的样式属性。它可以处理文字的字体、大小、颜色、对齐方式等各种样式设置。', {
        fontSize: 14,
        lineHeight: 1.6,
        color: '#333333'
      }, {
        padding: { top: 10, bottom: 10, left: 20, right: 20 }
      }),

      // 段落2 - 居中对齐
      createTextNode('支持左对齐、居中对齐和右对齐', {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0066cc',
        textAlign: 'center',
        textDecoration: 'underline'
      }, {
        padding: { top: 15, bottom: 15 }
      }),

      // 段落3 - 右对齐
      createTextNode('这段文字是右对齐的，展示了布局系统的灵活性。', {
        fontSize: 14,
        color: '#666666',
        textAlign: 'right'
      }, {
        padding: { top: 10, bottom: 10, left: 20, right: 20 }
      }),

      // 特殊样式文本
      createTextNode('特殊样式：大字体 + 字母间距', {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ff6600',
        letterSpacing: 2,
        textAlign: 'center'
      }, {
        padding: { top: 20, bottom: 10 },
        border: { width: 1, color: '#ff6600', style: 'dashed' }
      }),

      // 多行文本示例
      createTextNode('这是一段很长的文本，用来测试自动换行功能。当文本超出容器宽度时，系统会自动将文本分行显示，确保内容能够完整地呈现在指定的区域内。这个功能对于处理动态内容非常有用。', {
        fontSize: 13,
        lineHeight: 1.8,
        color: '#444444'
      }, {
        padding: { top: 15, bottom: 15, left: 20, right: 20 },
        border: { width: 1, color: '#dddddd', style: 'solid' }
      })
    ], {
      padding: { top: 10, bottom: 20 }
    })
  ], {
    padding: { top: 20, left: 20, right: 20, bottom: 20 }
  });
}

/**
 * 初始化示例
 */
export function initExample(canvas) {
  const engine = new CanvasLayoutEngine(canvas, {
    containerWidth: canvas.width,
    containerHeight: canvas.height,
    defaultFontSize: 14,
    defaultFontFamily: 'Arial, "Microsoft YaHei", sans-serif',
    defaultLineHeight: 1.4
  });

  const layout = createExampleLayout();
  engine.render(layout);

  return engine;
}

/**
 * 创建响应式布局示例
 */
export function createResponsiveExample(width) {
  const isMobile = width < 600;
  
  return createContainerNode([
    createTextNode('响应式布局', {
      fontSize: isMobile ? 20 : 28,
      fontWeight: 'bold',
      textAlign: 'center',
      color: '#2c3e50'
    }, {
      padding: { 
        top: isMobile ? 15 : 25, 
        bottom: isMobile ? 10 : 15 
      }
    }),

    createTextNode(
      isMobile 
        ? '移动端优化显示：较小的字体和紧凑的间距，适合小屏幕阅读。'
        : '桌面端显示：较大的字体和宽松的间距，提供更好的阅读体验和视觉效果。',
      {
        fontSize: isMobile ? 12 : 16,
        lineHeight: isMobile ? 1.4 : 1.6,
        color: '#34495e'
      },
      {
        padding: { 
          top: 10, 
          bottom: 20, 
          left: isMobile ? 15 : 30, 
          right: isMobile ? 15 : 30 
        }
      }
    )
  ]);
}

export default { createExampleLayout, initExample, createResponsiveExample };