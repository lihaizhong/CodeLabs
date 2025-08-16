/**
 * 测试脚本：运行包含错误的代码并捕获错误信息
 * 演示如何使用sourcemap-locator工具从错误位置追溯到原始源码
 */

const path = require('path');

// 由于src/index.js是ES模块，我们直接使用编译后的代码进行测试
// 加载压缩后的代码
const minifiedCode = require('./minified.js');

// 简化版的sourcemap定位功能，用于演示
const fs = require('fs');
const { SourceMapConsumer } = require('source-map');

/**
 * 测试函数：捕获并分析运行时错误
 */
function testRuntimeErrors() {
  console.log('=== 开始测试运行时错误定位 ===\n');
  
  const minifiedPath = path.join(__dirname, 'minified.js');
  
  // 测试1: ReferenceError - 未定义变量
  console.log('测试1: ReferenceError - 访问未定义变量');
  try {
    minifiedCode.calculateSum(1, 2);
  } catch (error) {
    console.log('捕获到错误:', error.message);
    console.log('错误堆栈:', error.stack);
    
    // 从错误堆栈中提取行列信息
    const stackMatch = error.stack.match(/minified\.js:(\d+):(\d+)/);
    if (stackMatch) {
      const line = parseInt(stackMatch[1]);
      const column = parseInt(stackMatch[2]);
      console.log(`压缩代码中的错误位置: 第${line}行，第${column}列`);
      
      // 使用sourcemap追溯到原始源码
      locateOriginalPosition(minifiedPath, line, column);
    }
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // 测试2: TypeError - 调用不存在的方法
  console.log('测试2: TypeError - 调用不存在的方法');
  try {
    minifiedCode.processData([1, 2, 3]);
  } catch (error) {
    console.log('捕获到错误:', error.message);
    console.log('错误堆栈:', error.stack);
    
    const stackMatch = error.stack.match(/minified\.js:(\d+):(\d+)/);
    if (stackMatch) {
      const line = parseInt(stackMatch[1]);
      const column = parseInt(stackMatch[2]);
      console.log(`压缩代码中的错误位置: 第${line}行，第${column}列`);
      
      locateOriginalPosition(minifiedPath, line, column);
    }
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // 测试3: TypeError - 访问null的属性
  console.log('测试3: TypeError - 访问null对象的属性');
  try {
    minifiedCode.accessProperty(null);
  } catch (error) {
    console.log('捕获到错误:', error.message);
    console.log('错误堆栈:', error.stack);
    
    const stackMatch = error.stack.match(/minified\.js:(\d+):(\d+)/);
    if (stackMatch) {
      const line = parseInt(stackMatch[1]);
      const column = parseInt(stackMatch[2]);
      console.log(`压缩代码中的错误位置: 第${line}行，第${column}列`);
      
      locateOriginalPosition(minifiedPath, line, column);
    }
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // 测试4: 自定义错误
  console.log('测试4: 自定义错误 - 类型检查失败');
  try {
    minifiedCode.divideNumbers('not a number', 5);
  } catch (error) {
    console.log('捕获到错误:', error.message);
    console.log('错误堆栈:', error.stack);
    
    const stackMatch = error.stack.match(/minified\.js:(\d+):(\d+)/);
    if (stackMatch) {
      const line = parseInt(stackMatch[1]);
      const column = parseInt(stackMatch[2]);
      console.log(`压缩代码中的错误位置: 第${line}行，第${column}列`);
      
      locateOriginalPosition(minifiedPath, line, column);
    }
  }
}

/**
 * 使用sourcemap定位原始源码位置
 */
async function locateOriginalPosition(filePath, line, column) {
  try {
    console.log('\n🔍 使用sourcemap追溯原始源码位置...');
    
    // 读取sourcemap文件
    const sourcemapPath = filePath + '.map';
    const sourcemapContent = fs.readFileSync(sourcemapPath, 'utf8');
    const sourcemap = JSON.parse(sourcemapContent);
    
    // 创建SourceMapConsumer
    const consumer = await new SourceMapConsumer(sourcemap);
    
    // 定位原始位置
    const originalPosition = consumer.originalPositionFor({
      line: line,
      column: column
    });
    
    if (originalPosition.source) {
      console.log('✅ 成功定位到原始源码!');
      console.log('📍 原始文件:', originalPosition.source);
      console.log('📍 原始位置: 第' + originalPosition.line + '行，第' + originalPosition.column + '列');
      console.log('📍 原始函数名:', originalPosition.name || '(匿名)');
      
      // 检查是否有进一步的sourcemap链（递归解析）
      const originalFilePath = path.resolve(path.dirname(filePath), originalPosition.source);
      const originalSourcemapPath = originalFilePath + '.map';
      
      if (fs.existsSync(originalSourcemapPath)) {
        console.log('🔗 发现更深层的sourcemap，继续递归解析...');
        await locateOriginalPosition(originalFilePath, originalPosition.line, originalPosition.column);
      }
    } else {
      console.log('❌ 无法定位到原始源码');
    }
    
    consumer.destroy();
  } catch (error) {
    console.log('❌ sourcemap定位过程中出错:', error.message);
  }
}

// 运行测试
if (require.main === module) {
  testRuntimeErrors();
}

module.exports = {
  testRuntimeErrors,
  locateOriginalPosition
};