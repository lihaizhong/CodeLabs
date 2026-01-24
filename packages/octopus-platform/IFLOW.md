# Octopus Platform 指令手册

## 项目概述

**Octopus Platform** 是一个高性能的**跨平台兼容性库**，专为解决多端开发中的API差异问题而设计。该项目通过插件化架构，为 Web 端（H5）、微信小程序、支付宝小程序、抖音小程序、鸿蒙应用等平台提供统一的 API 接口。

### 核心特性

- **插件化架构**: 支持灵活的功能扩展和依赖管理
- **多端兼容**: 统一 H5/微信小程序/支付宝小程序/抖音小程序/鸿蒙应用 API
- **高性能**: 优化的 Canvas 操作和数据处理能力
- **TypeScript 支持**: 完整的类型定义和严格类型检查
- **轻量级**: 最小化依赖，专注于兼容性处理

## 技术架构

### 核心技术栈

- **语言**: TypeScript 5.8.3 (严格模式)
- **构建工具**: Rollup 4.45.1
- **模块系统**: ESNext + UMD (双格式输出)
- **包管理器**: pnpm (推荐) / npm
- **版本管理**: Changeset

### 项目结构

```
octopus-platform/
├── src/                          # 源码目录
│   ├── index.ts                 # 入口文件
│   ├── platform.ts              # 核心平台类
│   ├── definePlugin.ts          # 插件定义工具
│   ├── installPlugin.ts         # 插件安装工具
│   ├── typings.ts               # 类型定义
│   ├── extensions/              # 扩展工具
│   │   ├── noop.ts             # 空函数工具
│   │   ├── retry.ts            # 重试机制
│   │   └── utf8.ts             # UTF-8 编码工具
│   └── plugins/                 # 插件实现
│       ├── plugin-canvas.ts     # Canvas 操作
│       ├── plugin-codec.ts      # 数据编解码
│       ├── plugin-download.ts   # 文件下载
│       ├── plugin-fsm.ts        # 状态机
│       ├── plugin-image.ts      # 图像处理
│       ├── plugin-intersection-observer.ts # 交叉观察器
│       ├── plugin-now.ts        # 时间API
│       ├── plugin-ofs-canvas.ts # 离屏Canvas
│       ├── plugin-path.ts       # 路径处理
│       ├── plugin-raf.ts        # 动画帧
│       └── plugin-selector.ts   # 选择器
├── __tests__/                   # 测试文件
├── __mocks__/                   # 测试 mocks
├── esm/                         # ES 模块输出
├── lib/                         # UMD 模块输出
└── rollup.config.js             # Rollup 配置
```

## 核心组件详解

### 1. OctopusPlatform (核心平台类)

抽象基类，提供跨平台功能的核心框架：

```typescript
abstract class OctopusPlatform<N extends keyof OctopusPlatformPlugins> {
  public platformVersion: string;  // 库版本
  public version: string;          // 应用版本
  public globals: OctopusPlatformGlobals; // 全局环境信息
  public noop = noop;              // 空函数工具
  public retry = retry;            // 重试机制
}
```

**支持的平台**:
- `weapp` - 微信小程序
- `alipay` - 支付宝小程序  
- `tt` - 抖音小程序
- `h5` - Web 端
- `harmony` - 鸿蒙应用
- `unknown` - 未知平台

### 2. 插件系统架构

#### 插件定义 (`definePlugin`)

```typescript
interface OctopusPlatformPluginOptions<
  N extends keyof OctopusPlatformPlugins,
  D extends keyof OctopusPlatformPlugins = never
> {
  name: N;                    // 插件名称
  dependencies?: D[];         // 依赖插件
  install: () => OctopusPlatformPlugins[N]; // 安装函数
}
```

#### 插件安装机制

1. **依赖解析**: 自动解析插件依赖关系
2. **递归安装**: 按依赖顺序安装插件
3. **属性注入**: 通过 `Object.defineProperty` 注入插件功能

### 3. 内置插件功能

| 插件名称 | 功能描述 | 依赖 |
|---------|---------|------|
| `getSelector` | DOM/组件选择器 | - |
| `getCanvas` | Canvas 实例获取 | `getSelector` |
| `getOfsCanvas` | 离屏 Canvas 创建 | - |
| `now` | 高精度时间获取 | - |
| `rAF` | 动画帧控制 | - |
| `walkIn` | 元素交叉观察 | - |
| `codec` | 数据编解码 | - |
| `remote` | 远程资源访问 | - |
| `local` | 本地存储 | - |
| `image` | 图像处理 | - |
| `path` | 路径处理 | - |

## 开发环境设置

### 环境要求

- **Node.js**: >= 18.x
- **包管理器**: pnpm >= 10.x (推荐) 或 npm >= 9.x
- **TypeScript**: 5.8.3 (项目已配置)

### 安装依赖

```bash
# 使用 pnpm (推荐)
pnpm install

# 或使用 npm
npm install
```

### 开发命令

```bash
# 类型声明生成
npm run declare

# 构建项目 (包含清理、声明生成、模块打包)
npm run build

# 清理生成文件
npm run cleanup

# 完整的构建流程
npm run build
```

### 构建输出

构建后将在以下目录生成文件：

- `esm/`: ES 模块格式 (ES2020)
- `lib/`: UMD 格式 (ES5 兼容)
- `index.d.ts`: TypeScript 类型声明文件
- 对应的 `.map` 源映射文件

## 使用指南

### 基本使用

#### 1. 创建扩展平台类

```typescript
import {
  OctopusPlatform,
  installPlugin,
  type OctopusPlatformPlugins,
  pluginCanvas,
  pluginDecode,
  pluginDownload,
  pluginFsm,
  pluginImage,
  pluginNow,
  pluginOfsCanvas,
  pluginPath,
  pluginRAF,
} from "octopus-platform";

// 定义支持的插件类型
export type PlatformProperties =
  | "now"
  | "path"
  | "remote"
  | "local"
  | "decode"
  | "image"
  | "rAF"
  | "getCanvas"
  | "getOfsCanvas";

class EnhancedPlatform extends OctopusPlatform<PlatformProperties> {
  // 声明插件属性
  now!: OctopusPlatformPlugins["now"];
  path!: OctopusPlatformPlugins["path"];
  remote!: OctopusPlatformPlugins["remote"];
  local!: OctopusPlatformPlugins["local"];
  decode!: OctopusPlatformPlugins["decode"];
  image!: OctopusPlatformPlugins["image"];
  rAF!: OctopusPlatformPlugins["rAF"];
  getCanvas!: OctopusPlatformPlugins["getCanvas"];
  getOfsCanvas!: OctopusPlatformPlugins["getOfsCanvas"];

  constructor() {
    super([
      pluginCanvas,      // Canvas 操作
      pluginOfsCanvas,   // 离屏 Canvas
      pluginDecode,      // 数据解码
      pluginDownload,    // 文件下载
      pluginFsm,         // 状态机
      pluginImage,       // 图像处理
      pluginNow,         // 时间API
      pluginPath,        // 路径处理
      pluginRAF,         // 动画帧
    ], __VERSION__);

    this.init();
  }

  installPlugin(
    plugin: OctopusPlatformPluginOptions<PlatformProperties>
  ) {
    installPlugin<PlatformProperties>(this, plugin);
  }
}

export const platform = new EnhancedPlatform();
```

#### 2. 访问平台信息

```typescript
// 版本信息
console.log(platform.platformVersion); // 当前库的版本
console.log(platform.version);         // 使用这个库的应用版本

// 全局环境信息
console.log(platform.globals.env);   // 当前平台 (h5/weapp/alipay/tt/harmony)
console.log(platform.globals.br);    // 当前平台的全局对象 (wx/my/tt/window)
console.log(platform.globals.dpr);   // 当前设备的设备像素比
console.log(platform.globals.system);// 当前系统类型 (ios/android/harmony)
```

#### 3. 使用插件功能

```typescript
// 获取高精度时间
const currentTime = platform.now(); // 毫秒级时间戳

// 获取 Canvas 实例
const { canvas, context } = await platform.getCanvas('#canvas');

// 高精度动画
const frameId = platform.rAF(canvas, () => {
  // 动画逻辑
  console.log('Animation frame');
});
```

### 自定义插件开发

#### 1. 定义新插件

```typescript
import { definePlugin } from "octopus-platform";

export default definePlugin<"customAPI">({  
  name: "customAPI",
  // 可选：声明依赖插件
  dependencies: ["now"],
  install() {
    const { env, br } = this.globals;
    
    // 在这里实现跨平台兼容逻辑
    if (env === "h5") {
      return () => {
        // H5 平台实现
        return "h5 implementation";
      };
    } else if (env === "weapp") {
      return () => {
        // 微信小程序实现
        return "weapp implementation";
      };
    }
    
    // 默认实现
    return () => "default implementation";
  },
});
```

#### 2. 集成自定义插件

```typescript
// 在平台类中集成
class EnhancedPlatform extends OctopusPlatform<PlatformProperties> {
  customAPI!: OctopusPlatformPlugins["customAPI"];

  constructor() {
    super([
      // ... 其他插件
      customPlugin, // 添加自定义插件
    ], __VERSION__);
  }

  installPlugin(plugin: OctopusPlatformPluginOptions<PlatformProperties>) {
    installPlugin<PlatformProperties>(this, plugin);
  }
}
```

## 平台兼容性

### 支持的平台矩阵

| 平台 | 全局对象 | Canvas 支持 | 性能 API | 文件系统 |
|-----|---------|-------------|----------|----------|
| H5 | `window` | ✅ `HTMLCanvasElement` | ✅ `performance.now()` | ✅ `localStorage` |
| 微信小程序 | `wx` | ✅ 小程序 Canvas | ✅ `wx.getPerformance()` | ✅ `wx.getFileSystemManager()` |
| 支付宝小程序 | `my` | ✅ 小程序 Canvas | ✅ `my.getPerformance()` | ✅ `my.getFileSystemManager()` |
| 抖音小程序 | `tt` | ✅ 小程序 Canvas | ✅ `tt.getPerformance()` | ✅ `tt.getFileSystemManager()` |
| 鸿蒙应用 | `has` | ✅ 鸿蒙 Canvas | ✅ `has.getPerformance()` | ✅ 鸿蒙文件系统 |

### 平台检测逻辑

自动环境检测按以下优先级进行：

1. **H5**: 检测 `window` 对象
2. **抖音小程序**: 检测 `tt` 对象 (优先于微信)
3. **支付宝小程序**: 检测 `my` 对象
4. **微信小程序**: 检测 `wx` 对象
5. **鸿蒙应用**: 检测 `has` 对象

## 测试策略

### 测试框架

- **主框架**: Jest
- **Mock 数据**: 自定义 `__mocks__` 目录
- **测试覆盖**: 核心平台功能 + 插件功能

### 测试命令

```bash
# 运行所有测试
npm test

# 监视模式运行测试
npm test -- --watch

# 运行特定测试文件
npm test -- index.spec.ts
```

### 现有测试

当前测试覆盖：
- ✅ 平台类定义验证
- ✅ 全局环境信息检测
- ✅ 插件系统基础功能
- ⏳ 多平台兼容性测试 (扩展中)

## 版本管理

### 当前版本

- **最新版本**: 0.2.0
- **发布状态**: 公开发布 (npm registry)
- **兼容性**: 遵循语义化版本控制

### 版本更新流程

1. **开发新功能或修复**:
   ```bash
   # 功能开发或 Bug 修复
   git checkout -b feature/new-feature
   # ... 进行开发和测试
   ```

2. **创建变更集**:
   ```bash
   # 使用 changeset 描述变更
   pnpm changeset
   ```

3. **版本更新**:
   ```bash
   # 更新版本号和生成变更日志
   pnpm changeset version
   ```

4. **构建发布**:
   ```bash
   # 构建项目
   npm run build
   
   # 发布到 npm
   npm publish
   ```

## 性能优化

### 核心优化策略

1. **双缓存渲染**: Canvas 操作使用双缓冲机制
2. **指数退避**: 重试机制使用指数退避算法
3. **按需加载**: 插件系统支持依赖管理和懒加载
4. **内存优化**: 提供图像释放和缓存管理

### 性能监控

- **时间精度**: 使用 `performance.now()` 获取高精度时间
- **内存管理**: 提供 `image.release()` 释放图像资源
- **帧率控制**: 统一的 `rAF` 接口确保流畅动画

## 常见问题解决

### 1. 构建问题

**问题**: TypeScript 编译错误
```bash
# 解决方案：重新生成类型声明
npm run declare
npm run build
```

**问题**: 模块格式不兼容
- 检查 `rollup.config.js` 输出配置
- 确认目标平台的模块支持情况

### 2. 插件问题

**问题**: 插件依赖错误
```
Plugin X depends on plugin Y, but Y is not found
```
- 检查 `dependencies` 数组配置
- 确保依赖插件已正确安装

**问题**: 插件安装失败
- 验证插件的 `install` 函数返回值类型
- 检查插件名称是否在 `PlatformProperties` 中定义

### 3. 平台兼容问题

**问题**: 自动检测失败
```typescript
// 手动指定平台
platform.switch('h5'); // 或 'weapp'/'alipay'/'tt'/'harmony'
```

**问题**: Canvas 获取失败
- 检查选择器语法 (H5: `#id`, 小程序: `.class`)
- 确认 Canvas 元素已正确渲染

## 贡献指南

### 代码规范

- **TypeScript**: 严格模式，所有类型必须明确声明
- **代码风格**: 遵循项目的 ESLint 配置
- **提交信息**: 使用约定式提交格式
- **测试**: 新功能必须包含测试用例

### 开发流程

1. **Fork 项目** → 创建特性分支
2. **功能开发** → 编写代码和测试
3. **代码审查** → 确保质量和规范
4. **合并代码** → 集成到主分支

### 提交信息格式

```bash
# 功能新增
feat: 添加新插件功能

# Bug 修复  
fix: 修复 Canvas 获取问题

# 文档更新
docs: 更新使用指南

# 重构
refactor: 优化插件安装逻辑

# 性能优化
perf: 提升图像处理性能
```

## 相关资源

- **GitHub 仓库**: https://github.com/lihaizhong/CodeLabs.git
- **问题反馈**: https://github.com/lihaizhong/CodeLabs/issues
- **npm 包**: https://www.npmjs.com/package/octopus-platform
- **许可证**: [MIT License](./LICENSE)

## 技术支持

如需技术支持或遇到问题，请：

1. 查看此文档的常见问题部分
2. 在 GitHub 仓库提交 Issue
3. 参考项目的测试用例和实现示例

---

**注意**: Octopus Platform 专注于跨平台兼容性处理，如需其他功能建议组合使用专门的功能库。