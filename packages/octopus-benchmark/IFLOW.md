# Octopus Benchmark 项目指令手册

## 项目概述

**Octopus Benchmark** 是一个专为 `Octopus Svga` 动效播放器设计的轻量级性能测试工具。该工具提供了精确的时间测量、性能监控和日志输出功能，支持跨平台兼容，特别适用于动效播放器的性能测试场景。

### 核心特性

- **轻量级设计**: 专为性能测试优化的简洁工具
- **跨平台兼容**: 通过 `octopus-platform` 插件系统实现多端支持
- **精确计时**: 提供 `performance.now()` 和 `Date.now()` 兼容的时间测量
- **动效优化**: 专门针对动效播放间隔时间的测试需求设计
- **格式化输出**: 带徽标的日志输出，便于性能数据识别

### 技术架构

- **语言**: TypeScript (严格模式)
- **构建工具**: Rollup + Babel
- **模块格式**: ESM + UMD 双格式支持
- **平台依赖**: `octopus-platform` (工作区依赖)
- **输出格式**: 压缩/非压缩版本 + 源映射

## 项目结构

```
octopus-benchmark/
├── src/
│   ├── index.ts          # 主入口文件 - 性能测试核心功能
│   └── platform.ts       # 平台适配层 - 跨平台兼容处理
├── esm/                  # ES 模块输出
├── lib/                  # UMD 模块输出
├── rollup.config.js      # Rollup 构建配置
├── tsconfig.json         # TypeScript 配置
├── package.json          # 包配置和依赖
└── CHANGELOG.md          # 版本变更记录
```

## 安装和使用

### 安装方式

```bash
npm install octopus-benchmark -S
```

### 引入使用

```typescript
import { benchmark } from "octopus-benchmark";
```

### 核心 API

#### `benchmark.now()`
获取当前时间点。如果环境不支持 `performance.now()`，自动降级使用 `Date.now()`。

#### `benchmark.time(label, callback)`
执行时间测量组合操作 (等价于 `benchmark.start()` + `benchmark.stop()`)。

```typescript
await benchmark.time('animation-render', () => {
  // 执行动画渲染逻辑
  renderAnimation();
});
```

#### `benchmark.mark(label)` 和 `benchmark.reset(label)`
持续计算动效间隔时间，常用于动效播放回调函数之间的间隔测量。

```typescript
// 在动画播放的 onProcess 回调中
benchmark.mark('frame-interval');

// 重置标记
benchmark.reset('frame-interval');
```

#### `benchmark.log()` 和 `benchmark.info()`
输出带徽标的日志信息，便于在控制台中识别性能测试输出。

#### `benchmark.line(size)`
输出分隔线，便于隔离性能测试日志信息。

## 构建和开发

### 构建命令

```bash
# 完整构建流程 (清理 + 类型声明 + 生成)
npm run build

# 仅清理临时文件
npm run cleanup

# 仅生成类型声明
npm run declare

# 仅执行 Rollup 构建
npm run generate
```

### 构建输出

构建完成后生成以下文件结构：

- **esm/index.js**: ES 模块格式 (开发环境)
- **esm/index.min.js**: ES 模块格式压缩版 (生产环境)
- **lib/index.js**: UMD 格式 (兼容环境)
- **lib/index.min.js**: UMD 格式压缩版 (生产环境)
- **index.d.ts**: TypeScript 类型定义文件

### 开发工作流

1. **开发环境**: 使用 ESM 格式进行开发测试
2. **类型检查**: 运行 `tsc` 进行严格类型检查
3. **构建优化**: 通过 Babel 进行代码转译和优化
4. **多格式支持**: 同时输出 ESM 和 UMD 格式

## 跨平台兼容性

### 平台适配机制

项目通过 `octopus-platform` 提供的插件系统实现跨平台兼容：

- **Web 端**: 使用浏览器原生 `performance.now()`
- **小程序环境**: 自动降级到 `Date.now()`
- **Node.js 环境**: 使用 Node.js 时间API

### 插件系统

```typescript
// platform.ts 中实现的插件安装
class EnhancedPlatform extends OctopusPlatform<PlatformProperties> {
  constructor() {
    super([pluginNow], __VERSION__);
    this.init();
  }
}
```

## 版本管理

当前版本: **2.0.0**

### 主要变更历史

- **2.0.0**: 修改插件命名 (plugin-decode → plugin-codec)，依赖更新
- **1.1.x**: 依赖包更新和兼容性改进  
- **1.0.x**: 平台能力增强和初始版本

## 项目集成

### 作为工作区包使用

该包作为 CodeLabs 项目的工作区依赖，可以通过以下方式在项目中使用：

```json
{
  "dependencies": {
    "octopus-platform": "workspace:^",
    "octopus-benchmark": "workspace:^"
  }
}
```

### 与 Octopus 生态集成

- **依赖关系**: 依赖 `octopus-platform` 提供平台抽象
- **使用场景**: 主要为 `octopus-svga` 动效播放器提供性能测试支持
- **开发模式**: 支持工作区开发模式下的热重载和调试

## 性能测试最佳实践

### 动效性能测试

```typescript
// 典型动效播放测试场景
await benchmark.time('total-animation', async () => {
  for (let i = 0; i < frameCount; i++) {
    const frameStart = benchmark.now();
    
    // 执行单帧渲染
    await renderFrame(i);
    
    const frameTime = benchmark.now() - frameStart;
    console.log(`Frame ${i}: ${frameTime}ms`);
    
    // 测量帧间隔
    benchmark.mark('frame-gap');
  }
});
```

### 性能监控建议

1. **使用 `mark()` 进行持续监控**: 在动画播放的回调函数中使用
2. **合理使用分隔线**: 使用 `benchmark.line()` 隔离不同测试场景
3. **标签命名规范**: 使用描述性的标签便于结果分析
4. **异步操作处理**: 配合 `async/await` 使用 `time()` 方法

## 故障排除

### 常见问题

1. **平台兼容性**: 确保 `octopus-platform` 版本兼容
2. **类型定义**: 检查 `index.d.ts` 文件是否正确生成
3. **构建失败**: 运行 `npm run cleanup` 清理后重新构建
4. **依赖问题**: 检查工作区依赖是否正确安装

### 调试模式

```typescript
// 启用详细日志输出
benchmark.info('Debug mode enabled');

// 查看当前平台信息
console.log('Current platform:', platform.now());
```

## 许可证

项目使用 MIT 许可证，详情请查看 [LICENSE](./LICENSE) 文件。

---

**注意**: 该工具专为 Octopus 动效播放器生态设计，适合需要精确性能测量的动效开发场景。如需技术支持，请查看 CodeLabs 项目仓库或提交 Issue。