/**
 * Octopus Layout 使用示例
 * 展示如何使用基于 CSS 属性的 Canvas 布局系统
 */

import CanvasLayoutEngine, { createTextNode, createContainerNode } from '../dist/index';

// 全局变量
let engines = {};
let layouts = {};
let currentTheme = 'light';

// 基础演示
function initBasicDemo() {
    const canvas = document.getElementById('basicDemo');
    engines.basic = new CanvasLayoutEngine(canvas, {
        containerWidth: 800,
        containerHeight: 400
    });

    updateBasicDemo();
}

function updateBasicDemo() {
    const theme = currentTheme === 'light' ? {
        bg: '#ffffff',
        primary: '#333333',
        secondary: '#666666',
        accent: '#007bff'
    } : {
        bg: '#2d3748',
        primary: '#ffffff',
        secondary: '#cbd5e0',
        accent: '#63b3ed'
    };

    layouts.basic = createContainerNode([
        createTextNode('Octopus Layout 演示', {
            fontSize: 28,
            fontWeight: 'bold',
            color: theme.primary,
            textAlign: 'center'
        }, {
            padding: { top: 20, bottom: 15 }
        }),

        createTextNode('基于 CSS 属性的 Canvas 2D 文字布局引擎', {
            fontSize: 16,
            color: theme.secondary,
            textAlign: 'center'
        }, {
            padding: { bottom: 25 }
        }),

        createContainerNode([
            createTextNode('左对齐文本：这是一段左对齐的文本内容，展示了基本的文字渲染功能。', {
                fontSize: 14,
                color: theme.primary,
                textAlign: 'left'
            }, {
                padding: { top: 10, bottom: 10, left: 20, right: 20 }
            }),

            createTextNode('居中对齐文本：支持多种对齐方式', {
                fontSize: 16,
                fontWeight: 'bold',
                color: theme.accent,
                textAlign: 'center',
                textDecoration: 'underline'
            }, {
                padding: { top: 15, bottom: 15 }
            }),

            createTextNode('右对齐文本：这段文字演示右对齐效果', {
                fontSize: 14,
                color: theme.secondary,
                textAlign: 'right'
            }, {
                padding: { top: 10, bottom: 10, left: 20, right: 20 }
            }),

            createTextNode('字体样式演示：', {
                fontSize: 16,
                fontWeight: 'bold',
                color: theme.primary,
                textAlign: 'left'
            }, {
                padding: { top: 20, bottom: 10, left: 20, right: 20 }
            }),

            createTextNode('正常字体 (normal) - 这是默认的字体样式', {
                fontSize: 14,
                fontStyle: 'normal',
                color: theme.primary,
                textAlign: 'left'
            }, {
                padding: { top: 5, bottom: 5, left: 40, right: 20 }
            }),

            createTextNode('斜体字体 (italic) - 这是斜体字体样式', {
                fontSize: 14,
                fontStyle: 'italic',
                color: theme.accent,
                textAlign: 'left'
            }, {
                padding: { top: 5, bottom: 5, left: 40, right: 20 }
            }),

            createTextNode('倾斜字体 (oblique) - 这是倾斜字体样式', {
                fontSize: 14,
                fontStyle: 'oblique',
                color: theme.secondary,
                textAlign: 'left'
            }, {
                padding: { top: 5, bottom: 15, left: 40, right: 20 }
            })
        ], {
            border: { width: 1, color: theme.secondary, style: 'solid' },
            padding: { top: 10, bottom: 10 }
        })
    ]);

    engines.basic.render(layouts.basic);
}

function changeTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    updateBasicDemo();
}

// 响应式演示
function initResponsiveDemo() {
    const desktopCanvas = document.getElementById('desktopDemo');
    const mobileCanvas = document.getElementById('mobileDemo');

    engines.desktop = new CanvasLayoutEngine(desktopCanvas, {
        containerWidth: 600,
        containerHeight: 300
    });

    engines.mobile = new CanvasLayoutEngine(mobileCanvas, {
        containerWidth: 300,
        containerHeight: 400
    });

    updateResponsiveDemo();
}

function updateResponsiveDemo() {
    // 桌面版布局
    layouts.desktop = createContainerNode([
        createTextNode('桌面版布局', {
            fontSize: 24,
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#2c3e50'
        }, {
            padding: { top: 20, bottom: 15 }
        }),

        createTextNode('较大的字体和宽松的间距，适合大屏幕显示。支持更丰富的内容展示和更好的视觉效果。', {
            fontSize: 16,
            lineHeight: 1.6,
            color: '#34495e'
        }, {
            padding: { top: 10, bottom: 20, left: 30, right: 30 }
        })
    ]);

    // 移动版布局
    layouts.mobile = createContainerNode([
        createTextNode('移动版布局', {
            fontSize: 18,
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#2c3e50'
        }, {
            padding: { top: 15, bottom: 10 }
        }),

        createTextNode('紧凑的设计，较小的字体和间距，适合小屏幕阅读。优化了移动设备的显示效果。', {
            fontSize: 12,
            lineHeight: 1.4,
            color: '#34495e'
        }, {
            padding: { top: 10, bottom: 15, left: 15, right: 15 }
        }),

        createTextNode('移动优先设计', {
            fontSize: 14,
            fontWeight: 'bold',
            color: '#e74c3c',
            textAlign: 'center'
        }, {
            padding: { top: 10, bottom: 10 },
            border: { width: 1, color: '#e74c3c', style: 'dashed' }
        })
    ]);

    engines.desktop.render(layouts.desktop);
    engines.mobile.render(layouts.mobile);
}

// 交互演示
function initInteractiveDemo() {
    const canvas = document.getElementById('interactiveDemo');
    engines.interactive = new CanvasLayoutEngine(canvas, {
        containerWidth: 800,
        containerHeight: 300
    });

    layouts.interactive = createContainerNode([
        createTextNode('交互演示 - 点击文字查看信息', {
            fontSize: 20,
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#2c3e50'
        }, {
            padding: { top: 20, bottom: 15 }
        }),

        createContainerNode([
            createTextNode('可点击的文本块 1', {
                fontSize: 16,
                color: '#007bff',
                textAlign: 'left'
            }, {
                padding: { top: 10, bottom: 10, left: 20, right: 20 },
                border: { width: 1, color: '#007bff', style: 'solid' }
            }),

            createTextNode('可点击的文本块 2', {
                fontSize: 16,
                color: '#28a745',
                textAlign: 'center'
            }, {
                padding: { top: 10, bottom: 10, left: 20, right: 20 },
                border: { width: 1, color: '#28a745', style: 'solid' }
            }),

            createTextNode('可点击的文本块 3', {
                fontSize: 16,
                color: '#dc3545',
                textAlign: 'right'
            }, {
                padding: { top: 10, bottom: 10, left: 20, right: 20 },
                border: { width: 1, color: '#dc3545', style: 'solid' }
            })
        ])
    ]);

    engines.interactive.render(layouts.interactive);

    // 添加点击事件
    canvas.addEventListener('click', (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const clickedNode = engines.interactive.getNodeAt(x, y, layouts.interactive);
        const infoDiv = document.getElementById('clickInfo');
        
        if (clickedNode) {
            infoDiv.innerHTML = `
                <strong>节点信息：</strong><br>
                类型: ${clickedNode.type}<br>
                ${clickedNode.content ? `内容: "${clickedNode.content}"<br>` : ''}
                位置: (${Math.round(clickedNode.x || 0)}, ${Math.round(clickedNode.y || 0)})<br>
                尺寸: ${Math.round(clickedNode.computedWidth || 0)} × ${Math.round(clickedNode.computedHeight || 0)}<br>
                ${clickedNode.style ? `样式: ${JSON.stringify(clickedNode.style)}` : ''}
            `;
        } else {
            infoDiv.innerHTML = '点击了空白区域';
        }
    });
}

// 动态更新演示
function initDynamicDemo() {
    const canvas = document.getElementById('dynamicDemo');
    engines.dynamic = new CanvasLayoutEngine(canvas, {
        containerWidth: 800,
        containerHeight: 250
    });

    layouts.dynamic = createContainerNode([
        createTextNode('动态更新演示', {
            fontSize: 20,
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#2c3e50'
        }, {
            padding: { top: 20, bottom: 15 }
        }),

        createTextNode('动态更新的文字内容', {
            fontSize: 16,
            color: '#333333',
            textAlign: 'left'
        }, {
            padding: { top: 15, bottom: 15, left: 20, right: 20 },
            border: { width: 1, color: '#ddd', style: 'solid' }
        })
    ]);

    engines.dynamic.render(layouts.dynamic);
}

function updateText() {
    const newText = document.getElementById('textInput').value;
    const textNode = layouts.dynamic.children[1]; // 第二个子节点是文本节点
    textNode.content = newText;
    engines.dynamic.render(layouts.dynamic);
}

function updateStyle() {
    const fontSize = parseInt(document.getElementById('fontSizeSelect').value);
    const color = document.getElementById('colorSelect').value;
    const textAlign = document.getElementById('alignSelect').value;
    
    const textNode = layouts.dynamic.children[1];
    textNode.style = {
        ...textNode.style,
        fontSize,
        color,
        textAlign
    };
    engines.dynamic.render(layouts.dynamic);
}

// 初始化所有演示
window.updateBasicDemo = updateBasicDemo;
window.changeTheme = changeTheme;
window.updateResponsiveDemo = updateResponsiveDemo;
window.updateText = updateText;
window.updateStyle = updateStyle;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    initBasicDemo();
    initResponsiveDemo();
    initInteractiveDemo();
    initDynamicDemo();
});
