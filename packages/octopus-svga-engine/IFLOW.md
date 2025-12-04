# Octopus Svga 项目指令手册

## 项目概述

Octopus Svga 是一个高性能的 SVGA 动画播放器，专门为移动端 **Web/小程序** 环境设计。该项目的核心目标是提供 **解析速度更快**、**体积更小**、**性能更高**、**兼容性更高**、**功能更丰富** 的 SVGA 动画播放解决方案。

### 项目信息
- **项目名称**: octopus-svga
- **当前版本**: 2.0.0
- **许可证**: MIT
- **作者**: lihzsky
- **仓库**: https://github.com/lihaizhong/CodeLabs.git

### 核心特性
- ✅ 兼容 Android 4.4+ / iOS 9+
- ✅ 整体大小 **~80Kb**，核心部分大小 **~50Kb**（解析器 + 播放器）
- ✅ 多端兼容：支持 **H5**、**微信小程序**、**支付宝小程序**、**抖音小程序**
- ✅ 优化 **protobuf** 解析器体积，增强二进制解析速度
- ✅ 支持 **双缓冲渲染机制** + **指数退避算法** 提升渲染性能
- ✅ 支持基于 SVGA 格式的 **模版海报** 绘制
- ✅ 支持动效文件 **管理器** 和 **编辑器**
- ✅ 内置 **二维码生成器** 和 **png 图片生成器**

### 技术限制
- ❌ 不支持播放 SVGA 1.x 格式
- ❌ 不支持声音播放

## 技术栈与架构

### 核心技术
- **语言**: TypeScript (ES2022)
- **构建工具**: Rollup
- **转译**: Babel
- **包管理**: pnpm
- **跨平台**: octopus-platform (peerDependency)

### 架构设计
项目采用分层架构设计，主要包含以下核心组件：

```
src/
├── core/                    # 核心组件
│   ├── painter/            # 画布渲染器
│   ├── parser/             # SVGA解析器  
│   ├── player/             # 播放器核心
│   └── poster/             # 海报生成器
├── extensions/             # 扩展组件
│   ├── svga-decoder/       # SVGA解码器
│   ├── svga-renderer/      # SVGA渲染器
│   ├── svga-animator/      # 动画器
│   ├── resource-manager/   # 资源管理器
│   ├── png-encoder/        # PNG编码器
│   ├── qrcode-encoder/     # 二维码编码器
│   └── zlib/              # 压缩库
├── helper/                 # 辅助工具
├── platform/              # 平台适配层
└── types/                 # 类型定义
```

## 构建与开发

### 构建命令
```bash
# 清理并构建项目
npm run build

# 分步执行
npm run cleanup     # 清理构建目录
npm run declare     # 生成TypeScript声明文件
npm run generate    # 生成ESM和UMD格式文件
```

### 构建输出
- **ESM格式**: `esm/index.js` (支持tree-shaking)
- **UMD格式**: `lib/index.js` (兼容传统环境)
- **TypeScript声明**: `index.d.ts`
- **压缩版本**: `.min.js` 文件

### 配置文件
- **TypeScript配置**: `tsconfig.json`
  - 目标: ESNext
  - 模块: ESNext
  - 严格模式: true
  - 仅生成声明文件模式
- **Rollup配置**: `rollup.config.js`
  - 多格式输出 (ESM + UMD)
  - Babel转译
  - 压缩优化
  - 外部依赖处理

### 依赖关系
```json
{
  "peerDependencies": {
    "octopus-platform": "workspace:^"
  },
  "devDependencies": {
    "@babel/core": "^7.28.0",
    "@rollup/plugin-babel": "^6.0.4",
    "rollup": "^4.45.1",
    "typescript": "^5.8.3"
  }
}
```

## 核心API使用

### 基础播放器
```typescript
import { Parser, Player } from "octopus-svga";

const player = new Player();
await player.setConfig({
  container: "#container",
});

const videoItem = await Parser.load("xx.svga");
await player.mount(videoItem);
player.start();
```

### 配置选项
```typescript
interface PlayerConfigOptions {
  container: string;        // 主屏Canvas选择器
  secondary?: string;       // 副屏Canvas选择器
  loop?: number;           // 循环次数(0=无限)
  fillMode?: "forwards" | "backwards" | "none";
  playMode?: "forwards" | "fallbacks";
  contentMode?: "fill" | "aspect-fit" | "aspect-fill" | "center";
  startFrame?: number;     // 开始帧
  endFrame?: number;       // 结束帧
  loopStartFrame?: number; // 循环开始帧
}
```

### 事件回调
```typescript
player.onStart = () => console.log("动画开始");
player.onResume = () => console.log("动画继续");
player.onPause = () => console.log("动画暂停");
player.onStop = () => console.log("动画停止");
player.onProcess = (percent, frame) => console.log(`进度: ${percent}, 帧: ${frame}`);
player.onEnd = () => console.log("动画结束");
```

### 进度控制
```typescript
// 跳转到指定帧
player.stepToFrame(10, true);

// 跳转到指定百分比
player.stepToPercentage(0.5, true);
```

## 高级功能

### 海报生成器
```typescript
import { Poster, VideoEditor } from "octopus-svga";

const poster = new Poster(750, 1180);
const videoEditor = new VideoEditor(poster.painter, poster.resource, videoItem);

// 替换元素
videoEditor.setImage("replace_001", "https://assets.xxx.com/image.png");

// 动态元素
const context = videoEditor.getContext();
context.fillText("hello svga!", 375, 590);
videoEditor.setCanvas("dynamic_001", context, {
  mode: "A",
  width: 375,
  height: 400,
});

await poster.mount(videoItem);
poster.draw();
const imageData = poster.toImageData();
```

### 动效管理器
```typescript
import { VideoManager, Player } from "octopus-svga";

const videoManager = new VideoManager("fast");
videoManager.prepare([
  "https://assets.xxx.com/1.svga",
  "https://assets.xxx.com/2.svga"
], 0, 3);

const bucket = videoManager.go(3);
await player.mount(bucket.entity);
player.start();
```

## 平台特性

### 画布清理方案
| 平台 | Canvas | OffscreenCanvas |
|------|--------|-----------------|
| 微信小程序 | RESIZE | RESIZE |
| 支付宝小程序 | CLEAR | RESIZE |
| 抖音小程序 | RESIZE | CLEAR |
| 浏览器 | RESIZE | RESIZE |

### 跨平台适配
项目通过 `octopus-platform` 提供跨平台兼容，主要支持：
- **H5环境**: 浏览器环境
- **微信小程序**: wx环境
- **支付宝小程序**: my环境  
- **抖音小程序**: tt环境

## 性能优化

### 核心优化策略
1. **双缓存渲染机制**: 提升动画播放流畅度
2. **指数退避算法**: 动态调整渲染块大小，平衡性能和流畅度
3. **数据复用技术**: 减少内存分配
4. **Worker加速**: 支持后台处理减少主线程阻塞

### 渲染性能指标
```typescript
// 渲染时间限制
const MAX_DRAW_TIME_PER_FRAME = 8;
const MAX_ACCELERATE_DRAW_TIME_PER_FRAME = 3;
const MAX_DYNAMIC_CHUNK_SIZE = 34;
const MIN_DYNAMIC_CHUNK_SIZE = 1;
```

## 开发规范

### 代码风格
- TypeScript严格模式
- ESLint规则检查
- 约定式提交信息格式

### 目录规范
- `src/`: 源码目录
- `lib/`: UMD构建输出
- `esm/`: ESM构建输出  
- `types/`: TypeScript声明文件
- `protos/`: protobuf定义

### 导出规范
```typescript
// 主要导出
export { Parser } from "./core/parser";
export { Player } from "./core/player";
export { Painter } from "./core/painter";
export { Poster } from "./core/poster";

// 命名空间导出
export * from "./platform";
export * from "./helper";
export * from "./types";
```

## 版本管理

### 版本控制
- 使用 [Changeset](https://github.com/changesets/changesets) 进行版本控制
- 支持独立包版本管理
- 自动化版本更新和发布流程

### 发布配置
```json
{
  "publishConfig": {
    "registry": "https://registry.npmjs.org/",
    "access": "public"
  }
}
```

## 故障排除

### 常见问题

1. **依赖安装问题**
   ```bash
   # 清理缓存重新安装
   pnpm store prune
   pnpm install
   ```

2. **构建失败**
   ```bash
   # 检查TypeScript类型
   npm run declare
   
   # 重新生成构建
   npm run build
   ```

3. **运行时错误**
   - 确保 `octopus-platform` 已正确安装
   - 检查Canvas容器选择器是否有效
   - 验证SVGA文件格式和版本兼容性

### 调试工具
- 内置性能监控
- 资源加载状态追踪
- 渲染性能指标收集

## 贡献指南

1. Fork项目仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交变更 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

### 提交规范
遵循[约定式提交](https://www.conventionalcommits.org/)规范：
- `feat:` 新功能
- `fix:` 修复
- `docs:` 文档
- `style:` 格式
- `refactor:` 重构
- `test:` 测试
- `chore:` 构建

## 许可证

项目使用 MIT 许可证，详情请查看 [LICENSE](./LICENSE) 文件。

---

**注意**: 本项目专注于高性能动画播放技术，适合需要跨平台动画解决方案的业务场景。如需技术支持，请查看各组件的详细文档或在 GitHub 上提交 Issue。