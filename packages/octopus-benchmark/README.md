# Octopus Benchmark

为 `Octopus Svga` 动效播放器测试开发的一款性能测试工具。

## 安装

```bash
npm install octopus-benchmark -S
```

## 使用

### 引入方式

```ts
import { benchmark } from "octopus-benchmark";
```

### benchmark.now()

时间点。如果当前环境不支持 `performance.now()`，使用 `Date.now()` 替代。

### benchmark.time() （benchmark.start() 和 benchmark.stop()的组合）

计算一个函数执行所用的时间。

### benchmark.line()

隔离前面的日志信息。

### benchmark.log()

打印带徽标的日志信息。

### benchmark.mark() 和 benchmark.reset()

持续计算动效间隔的时间。常用于动效播放时触发的回调函数（如 `onProcess` 之间的间隔时间）。

## LICENSE

[MIT](./LICENSE)
