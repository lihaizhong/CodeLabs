# Sourcemap 错误定位演示

这个目录包含了一个完整的演示，展示如何使用 `sourcemap-locator` 工具从运行时错误追溯到原始源码位置。

## 文件说明

### 源码文件
- `original.js` - 原始源码，包含故意添加的运行时错误
- `compiled.js` - 第一层编译后的代码
- `minified.js` - 最终压缩后的代码

### Sourcemap 文件
- `compiled.js.map` - 第一层sourcemap（original.js → compiled.js）
- `minified.js.map` - 第二层sourcemap（compiled.js → minified.js）

### 演示脚本
- `complete-demo.js` - 完整的错误定位演示
- `test-errors.js` - 基础的错误测试脚本
- `demo-cli.js` - CLI工具使用演示
- `find-positions.js` - 位置分析工具

## 运行演示

### 1. 完整演示（推荐）

```bash
node complete-demo.js
```

这个脚本会：
1. 运行包含错误的压缩代码
2. 捕获运行时错误和位置信息
3. 递归解析sourcemap链
4. 精确定位到原始源码中的错误位置
5. 显示错误上下文和源码内容

### 2. 基础错误测试

```bash
node test-errors.js
```

测试多种类型的运行时错误：
- 未定义变量访问
- 调用不存在的方法
- 访问null/undefined属性
- 自定义错误抛出

### 3. CLI工具使用

```bash
# 查找错误位置
node find-positions.js

# 使用CLI工具定位（需要先找到正确的位置）
node ../bin/index.js locate minified.js 1 55 --recursive
```

## 演示结果

运行 `complete-demo.js` 的典型输出：

```
🚀 Sourcemap错误定位完整演示
==================================================

📋 运行包含错误的压缩代码...

🧪 测试1: 触发undefinedVariable错误
❌ 捕获到错误: undefinedVariable is not defined
📍 错误位置: minified.js 第1行第55列

🔍 开始sourcemap追溯...
==================================================

🔍 解析层级 1: minified.js (1:55)
✅ 映射到: compiled.js (1:55)
🔗 发现更深层sourcemap，继续解析...
  🔍 解析层级 2: compiled.js (1:55)
  ✅ 映射到: original.js (3:24)
  📍 最终源码位置: original.js (3:24)

==================================================
📊 错误定位结果总结:
==================================================
❌ 运行时错误: undefinedVariable is not defined
📍 压缩代码位置: minified.js (1:55)
📍 原始源码位置: original.js (3:24)
🏷️  函数名: undefinedVariable

📄 原始源码内容:
==================================================
      1: function calculateSum(x, y) {
      2:   // 故意引入运行时错误：访问未定义的变量
>>>   3:   console.log('计算开始:', undefinedVariable); // 这里会抛出 ReferenceError
                                  ^
      4:   return x + y;
      5: }

✅ 错误定位演示完成!
```

## 技术要点

### 递归Sourcemap解析

这个演示展示了多层sourcemap的递归解析：

1. **第一层**: `minified.js` → `compiled.js`
2. **第二层**: `compiled.js` → `original.js`

### 错误类型

演示包含了常见的JavaScript运行时错误：

- **ReferenceError**: 访问未定义变量
- **TypeError**: 调用不存在的方法
- **TypeError**: 访问null/undefined属性
- **自定义Error**: 业务逻辑错误

### 位置映射精度

演示展示了精确的位置映射：
- 从压缩代码的行列位置
- 递归追溯到原始源码的确切位置
- 包含函数名和上下文信息

## 实际应用场景

这个演示模拟了真实的生产环境场景：

1. **生产环境错误监控**: 当生产环境的压缩代码抛出错误时
2. **错误日志分析**: 从错误堆栈信息中提取位置
3. **源码定位**: 使用sourcemap追溯到开发时的原始源码
4. **快速调试**: 精确定位问题代码位置

## 扩展使用

你可以基于这个演示：

1. 集成到错误监控系统中
2. 添加更多层级的sourcemap测试
3. 测试不同的构建工具生成的sourcemap
4. 集成到CI/CD流程中进行自动化测试

---

**注意**: 这个演示使用了 `sourcemap-locator` 项目的递归解析功能，展示了从运行时错误到原始源码的完整追溯流程。