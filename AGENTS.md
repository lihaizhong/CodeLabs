# CodeLabs 项目指令手册

## 项目概述

CodeLabs 是一个专注于**高性能跨平台动画播放**的工程展示项目。该项目通过多个核心组件构建了一个完整的多端动画播放解决方案，主要支持 Web 端、微信小程序、支付宝小程序、抖音小程序等平台。

### 核心技术栈

- **包管理器**: pnpm (版本 >= 10.x)
- **构建工具**: Vite (Rolldown Vite)
- **语言**: TypeScript
- **测试框架**: Jest
- **项目管理**: Monorepo 架构

### 核心组件

1. **OctopusSvga** - 高性能 SVGA 动效播放器
2. **OctopusPlatform** - 多平台兼容工具
3. **OctopusBenchmark** - 性能测试工具
4. **Excelsior Channel** - 数据通道组件
5. **Excelsior Image** - 图像处理组件

## 项目结构

```
CodeLabs/
├── packages/              # 核心包目录
│   ├── octopus-svga/      # SVGA动效播放器
│   ├── octopus-platform/  # 跨平台兼容层
│   ├── octopus-benchmark/ # 性能测试工具
│   ├── excelsior-channel/ # 数据通道
│   ├── excelsior-image/   # 图像处理
│   └── ...
├── mp-platform/           # 多平台示例项目
│   ├── www/              # Web端示例
│   ├── weapp/            # 微信小程序
│   ├── alipay/           # 支付宝小程序
│   └── tt/               # 抖音小程序
├── mp-harmony/           # 鸿蒙应用示例
├── experiments/          # 实验性项目
│   ├── hello-sse/        # SSE实验
│   ├── hello-international/ # 国际化实验
│   ├── hello-chat/       # 聊天实验
│   ├── hello-like-redis/ # Redis模拟
│   └── hello-stone/      # 石子游戏
└── public/              # 公共资源文件
```

## 常用命令

### 开发环境
```bash
# 安装依赖（仅允许使用pnpm）
pnpm install

# 启动Web开发服务器
pnpm dev

# 启动小程序开发服务器
pnpm minio

# 运行测试
pnpm test
```

### 构建和发布
```bash
# 创建变更集
pnpm changeset

# 更新版本号
pnpm changeset version

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

这是项目的明星组件，提供了一个高性能的 SVGA 动画播放解决方案：

**主要特性**:
- 体积小 (~80Kb 总体积，~50Kb 核心)
- 解析速度快（使用 fflate 替代 poka）
- 内存占用小（数据复用技术）
- 多端兼容（Web、小程序）
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
- 数据解码 (pluginDecode)
- 文件下载 (pluginDownload)
- 图像处理 (pluginImage)
- 性能计时 (pluginNow)

**使用示例**:
```typescript
import { OctopusPlatform, pluginCanvas } from "octopus-platform";

class EnhancedPlatform extends OctopusPlatform<PlatformProperties> {
  constructor() {
    super([pluginCanvas], __VERSION__);
  }
}
```

## 开发规范

### 代码风格
- 使用 TypeScript 严格模式
- 遵循 ESLint 规则
- 提交信息使用约定式提交格式

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
1. **Web 端**: 基于 Vite 构建，支持 H5 环境
2. **微信小程序**: 使用原生小程序框架
3. **支付宝小程序**: 兼容支付宝小程序 API
4. **抖音小程序**: 支持抖音小程序特性
5. **鸿蒙应用**: 基于 HarmonyOS 开发

### 开发模式
- 每个平台有独立的配置文件
- 使用 octopus-platform 进行平台适配
- 支持离线编译和在线预览

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
2. **指数退避算法**: 优化内存使用
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
# TypeScript 类型检查
pnpm run type-check

# 构建所有包
pnpm run build

# 单独构建某个包
cd packages/octopus-svga
pnpm build
```

### 测试问题
```bash
# 运行特定测试
pnpm test -- testName

# 监控模式运行测试
pnpm test -- --watch
```

## 贡献指南

1. Fork 项目仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交变更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 提交流程
1. 创建 changeset 描述变更
2. 确保所有测试通过
3. 更新相关文档
4. 遵循代码审查流程

## 许可证

项目使用 MIT 许可证，详情请查看 [LICENSE](./LICENSE) 文件。

---

**注意**: 本项目专注于高性能动画播放技术，适合需要跨平台动画解决方案的业务场景。如需技术支持，请查看各组件的详细文档或在 GitHub 上提交 Issue。