# Sourcemap Locator

一个强大的 Sourcemap 定位器工具，支持多层 sourcemap 递归解析，从压缩代码追溯到原始源码。

## 功能特性

- 🔍 **多层递归解析**: 支持多层 sourcemap 的递归定位
- 🚀 **高性能**: 内置缓存机制，提升解析性能
- 📦 **多种使用方式**: 支持 CLI、API 和编程接口
- 🛡️ **类型安全**: 完整的 TypeScript 类型定义
- 🔧 **灵活配置**: 支持自定义配置选项

## 安装

```bash
npm install @codelabs/sourcemap-locator
```

## 使用方法

### CLI 命令行

```bash
# 定位单个位置
sourcemap-locator locate --file dist/bundle.js --line 1 --column 100

# 批量定位
sourcemap-locator batch --config locations.json

# 验证 sourcemap
sourcemap-locator validate --file dist/bundle.js.map
```

### 编程 API

```typescript
import { locateRecursively, batchLocateRecursively, validateSourcemap } from '@codelabs/sourcemap-locator';

// 单个位置定位
const result = await locateRecursively({
  file: 'dist/bundle.js',
  line: 1,
  column: 100
});

if (result.success) {
  console.log('原始位置:', result.result.sourceFile);
  console.log('映射步骤:', result.result.mappingSteps);
}

// 批量定位
const batchResult = await batchLocateRecursively({
  locations: [
    { file: 'dist/bundle.js', line: 1, column: 100 },
    { file: 'dist/bundle.js', line: 2, column: 200 }
  ]
});

// 验证 sourcemap
const validation = validateSourcemap('path/to/sourcemap.json');
if (validation.success) {
  console.log('Sourcemap 有效');
}
```

### 类实例化使用

```typescript
import { RecursiveLocator } from '@codelabs/sourcemap-locator';

const locator = new RecursiveLocator({
  maxDepth: 10,
  enableCache: true,
  cacheSize: 100
});

// 监听事件
locator.on('step', (step) => {
  console.log('解析步骤:', step);
});

locator.on('error', (error) => {
  console.error('解析错误:', error);
});

// 执行定位
const result = await locator.locateRecursively({
  file: 'dist/bundle.js',
  line: 1,
  column: 100
});
```

## 配置选项

```typescript
interface RecursiveLocatorOptions {
  maxDepth?: number;        // 最大递归深度，默认 10
  enableCache?: boolean;    // 是否启用缓存，默认 true
  cacheSize?: number;       // 缓存大小，默认 100
  timeout?: number;         // 超时时间（毫秒），默认 30000
}
```

## API 参考

### 类型定义

```typescript
// 位置请求
interface LocationRequest {
  file: string;     // 文件路径
  line: number;     // 行号（1-based）
  column: number;   // 列号（0-based）
}

// 定位结果
interface LocateResult {
  success: boolean;
  result?: SourceLocation;
  error?: string;
}

// 源码位置
interface SourceLocation {
  inputPosition: Position;
  outputPosition: Position;
  sourceFile: string;
  depth: number;
  sourcemapPath: string;
  mappingSteps?: MappingStep[];
}
```

### 主要方法

- `locateRecursively(request: LocationRequest): Promise<LocateResult>`
- `batchLocateRecursively(request: BatchLocationRequest): Promise<BatchLocateResult>`
- `validateSourcemap(sourcemapContent: string): ValidationResult`

## 事件系统

```typescript
// 支持的事件类型
type EventType = 'step' | 'error' | 'cache_hit' | 'cache_miss';

// 事件监听
locator.on('step', (step: MappingStep) => {
  // 处理解析步骤
});

locator.on('error', (error: SourcemapLocatorError) => {
  // 处理错误
});
```

## 开发

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 运行测试
npm test

# 代码检查
npm run lint
```

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！