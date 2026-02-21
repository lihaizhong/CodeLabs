# CodeLabs 项目指令手册

## 项目概述

CodeLabs 是一个专注于**高性能跨平台动画播放**的工程展示项目。该项目通过多个核心组件构建了一个完整的多端动画播放解决方案，主要支持 Web 端、微信小程序、支付宝小程序、抖音小程序、鸿蒙应用等平台。

### 核心技术栈

- **包管理器**: pnpm (版本 >= 10.x)
- **构建工具**: Vite 7.x (Rolldown Vite) + Rollup 4.x
- **语言**: TypeScript 5.9.x
- **测试框架**: Jest 30.x
- **项目管理**: Monorepo 架构
- **版本管理**: Changeset

### 核心组件

| 组件 | 版本 | 描述 |
|------|------|------|
| **octopus-svga** | 2.0.1 | 高性能 SVGA 动效播放器（主包） |
| **octopus-svga-engine** | 2.0.0 | SVGA 渲染引擎核心 |
| **octopus-svga-animator** | 2.0.0 | SVGA 动画控制器 |
| **octopus-svga-poster** | 2.0.0 | SVGA 海报生成器 |
| **octopus-platform** | 0.2.2 | 多平台兼容层 |
| **octopus-benchmark** | 2.0.0 | 性能测试工具 |
| **octopus-gesture** | 1.0.0 | 手势识别库 |
| **octopus-virtual-scroll** | 1.0.0 | 虚拟滚动组件 |
| **excelsior-channel** | - | 数据通道组件 |
| **excelsior-image** | - | 图像处理组件 |
| **sourcemap-locator** | 1.0.0 | Sourcemap 定位工具 |
| **data-chain** | 1.0.0 | JSON-SCHEMA 数据校验工具 |
| **you-need-suggest** | 0.1.1 | 本地动态筛选功能 |
| **uni-engine** | 1.0.0 | Web 端模拟小程序引擎 |
| **uni-kits** | 1.0.0 | 通用工具包 |

## 项目结构

```
CodeLabs/
├── packages/                    # 核心包目录
│   ├── octopus-svga/           # SVGA动效播放器主包
│   ├── octopus-svga-engine/    # SVGA渲染引擎
│   ├── octopus-svga-animator/  # SVGA动画控制器
│   ├── octopus-svga-poster/    # SVGA海报生成器
│   ├── octopus-platform/       # 跨平台兼容层
│   ├── octopus-benchmark/      # 性能测试工具
│   ├── octopus-gesture/        # 手势识别库
│   ├── octopus-virtual-scroll/ # 虚拟滚动组件
│   ├── excelsior-channel/      # 数据通道
│   ├── excelsior-image/        # 图像处理
│   ├── sourcemap-locator/      # Sourcemap定位工具
│   ├── data-chain/             # 数据校验工具
│   ├── you-need-suggest/       # 动态筛选工具
│   ├── uni-engine/             # 小程序模拟引擎
│   └── uni-kits/               # 通用工具包
├── mp-platform/                 # 多平台示例项目
│   ├── www/                    # Web端示例
│   ├── weapp/                  # 微信小程序
│   ├── alipay/                 # 支付宝小程序
│   └── tt/                     # 抖音小程序
├── mp-harmony/                  # 鸿蒙应用示例
├── experiments/                 # 实验性项目
│   ├── hello-sse/              # SSE实验
│   ├── hello-international/    # 国际化实验
│   ├── hello-chat/             # 聊天实验
│   ├── hello-like-redis/       # Redis模拟
│   └── hello-stone/            # 石子游戏
├── .iflow/                      # AI开发环境配置
│   ├── agents/                 # AI Agent配置
│   └── skills/                 # AI技能配置
├── public/                      # 公共资源文件
└── .scripts/                    # 项目脚本
```

## 常用命令

### 开发环境
```bash
# 安装依赖（仅允许使用pnpm）
pnpm install

# 启动Web开发服务器
pnpm dev

# 启动静态服务器
pnpm serve

# 运行测试
pnpm test

# 预览构建结果
pnpm preview
```

### 构建和发布
```bash
# 创建变更集
pnpm changeset

# 更新版本号
pnpm changeset version

# 构建主项目
pnpm build

# 构建特定包
pnpm --filter <package-name> build

# 发布包
pnpm --filter <package-name> publish
```

### 特殊功能
```bash
# 同步脚本
pnpm zx:sync

# 清理脚本
pnpm zx:clear

# 构建ASCF项目
pnpm build:ascf
```

## 核心功能详解

### OctopusSvga 动效播放器

这是项目的明星组件，提供了一个高性能的 SVGA 动画播放解决方案。项目采用模块化架构，核心包拆分为四个子包：

**模块架构**:
- `octopus-svga-engine`: 渲染引擎核心，负责底层渲染逻辑
- `octopus-svga-animator`: 动画控制器，管理动画状态和帧更新
- `octopus-svga-poster`: 海报生成器，支持静态帧导出
- `octopus-svga`: 主包，整合所有功能模块

**主要特性**:
- 体积小 (~80Kb 总体积，~50Kb 核心)
- 解析速度快（使用 fflate 替代 poka）
- 内存占用小（数据复用技术）
- 多端兼容（Web、小程序、鸿蒙）
- 双缓存技术和指数退避算法

**使用示例**:
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

### OctopusPlatform 跨平台兼容层

提供了统一的跨平台 API 接口，支持插件化扩展：

**支持的插件类型**:
- Canvas 操作 (pluginCanvas)
- 离屏 Canvas (pluginOfsCanvas)
- 数据编解码 (pluginCodec)
- 文件下载 (pluginDownload)
- 图像处理 (pluginImage)
- 性能计时 (pluginNow)
- 动画帧 (pluginRAF)
- 状态机 (pluginFsm)
- 路径处理 (pluginPath)
- 交叉观察器 (pluginIntersectionObserver)

**使用示例**:
```typescript
import { OctopusPlatform, pluginCanvas, pluginNow } from "octopus-platform";

type PlatformProperties = "now" | "getCanvas" | "getOfsCanvas";

class EnhancedPlatform extends OctopusPlatform<PlatformProperties> {
  constructor() {
    super([pluginCanvas, pluginNow], __VERSION__);
    this.init();
  }
}
```

### Sourcemap Locator

强大的 Sourcemap 定位工具，支持多层递归解析：

**主要特性**:
- 支持多层递归解析
- CLI 和编程 API 双模式
- 自动定位原始源码位置

**使用示例**:
```bash
# CLI 模式
sml --file dist/bundle.js --line 10 --column 5 --sourcemap dist/bundle.js.map

# 简写
sml -f dist/bundle.js -l 10 -c 5 -s dist/bundle.js.map
```

### OctopusGesture 手势识别库

提供统一的手势识别接口：

**主要特性**:
- 支持常见手势（点击、滑动、缩放、旋转等）
- 跨平台兼容
- 基于 octopus-platform 插件系统

### OctopusVirtualScroll 虚拟滚动

高性能虚拟滚动组件：

**主要特性**:
- 大数据列表渲染优化
- 动态高度支持
- 平滑滚动体验

## 开发规范

### 代码风格
- 使用 TypeScript 严格模式
- 遵循 ESLint 规则
- 提交信息使用约定式提交格式

### 包构建规范
所有可发布包遵循统一的构建规范：
- 输出格式: ESM (`esm/`) + UMD (`lib/`)
- 类型声明: `index.d.ts`
- 压缩版本: `.min.js`

### 测试要求
- 所有核心功能需要单元测试
- 使用 Jest 作为测试框架
- 性能测试通过 OctopusBenchmark 进行

### 版本管理
- 使用 Changeset 进行版本控制
- 支持独立包版本管理
- 自动化版本更新和发布流程

## 多平台开发

### 平台支持
| 平台 | 全局对象 | 状态 |
|------|---------|------|
| H5/Web | `window` | ✅ 支持 |
| 微信小程序 | `wx` | ✅ 支持 |
| 支付宝小程序 | `my` | ✅ 支持 |
| 抖音小程序 | `tt` | ✅ 支持 |
| 鸿蒙应用 | `has` | ✅ 支持 |

### 开发模式
- 每个平台有独立的配置文件
- 使用 octopus-platform 进行平台适配
- 支持离线编译和在线预览

## AI 开发环境

项目集成了 iFlow AI 开发环境，提供智能辅助开发能力：

### 可用 Agents
| Agent | 描述 |
|-------|------|
| architect-reviewer | 架构一致性审查 |
| code-auditor | 代码质量审计 |
| context-manager | 上下文管理 |
| debugger | 调试专家 |
| docs-architect | 文档架构师 |
| format-html-agent | HTML 格式化 |
| frond-master | 前端设计专家 |
| frontend-developer | 前端开发 |
| frontend-expert | 前端架构师 |
| javascript-pro | JavaScript 专家 |
| perception-agent | 内容感知分析 |
| performance-engineer | 性能工程 |
| reference-builder | 参考文档构建 |
| test-automator | 测试自动化 |
| tutorial-engineer | 教程工程师 |
| typescript-pro | TypeScript 专家 |
| web-view | 网页设计师 |

### 可用 Skills
| Skill | 描述 |
|-------|------|
| doc-coauthoring | 文档协作工作流 |
| frontend-design | 前端界面设计 |
| webapp-testing | Web 应用测试 |

## 实验性项目

项目包含了多个实验性组件，位于 `experiments/` 目录：

- **hello-sse**: Server-Sent Events 实验
- **hello-international**: 国际化系统实验  
- **hello-chat**: 聊天系统实验
- **hello-like-redis**: Redis 模拟实验
- **hello-stone**: 石子游戏实验

这些实验项目用于探索新技术和验证概念。

## 性能优化

### 核心优化策略
1. **双缓存渲染机制**: 提升动画播放流畅度
2. **指数退避算法**: 动态调整渲染块大小，优化内存使用
3. **Worker 加速**: 支持后台处理减少主线程阻塞
4. **数据复用技术**: 减少内存分配

### 监控和测试
- 使用 OctopusBenchmark 进行性能测试
- 支持内存占用监控
- 提供帧率和渲染性能指标

## 常见问题解决

### 依赖安装问题
```bash
# 如果遇到权限问题
sudo chown -R $USER:$GROUP ~/.npm
sudo chown -R $USER:$GROUP ~/.config

# 清理缓存重新安装
pnpm store prune
pnpm install
```

### 编译问题
```bash
# TypeScript 类型检查（单个包）
cd packages/octopus-svga
pnpm run declare

# 构建单个包
pnpm build

# 构建所有包
pnpm -r build
```

### 测试问题
```bash
# 运行测试
pnpm test

# 运行特定测试
pnpm test -- testName

# 监控模式运行测试
pnpm test -- --watch
```

## 贡献指南

1. Fork 项目仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交变更 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 提交流程
1. 创建 changeset 描述变更
2. 确保所有测试通过
3. 更新相关文档
4. 遵循代码审查流程

### 提交信息规范
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
