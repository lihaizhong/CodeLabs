#!/usr/bin/env node

/**
 * 完整的sourcemap错误定位演示
 * 展示从运行时错误到原始源码定位的完整流程
 */

const fs = require('fs');
const { SourceMapConsumer } = require('source-map');

console.log('🚀 Sourcemap错误定位完整演示');
console.log('==================================================\n');

/**
 * 递归解析sourcemap链，追溯到最终的原始源码位置
 * @param {string} file - 当前文件名
 * @param {number} line - 行号（1基索引）
 * @param {number} column - 列号（1基索引）
 * @param {number} depth - 当前递归深度
 * @returns {Promise<Object>} 最终的源码位置信息
 */
async function locateOriginalPosition(file, line, column, depth = 0) {
  const maxDepth = 10;
  const indent = '  '.repeat(depth);
  
  console.log(`${indent}🔍 解析层级 ${depth + 1}: ${file} (${line}:${column})`);
  
  if (depth >= maxDepth) {
    console.log(`${indent}⚠️  达到最大递归深度 ${maxDepth}`);
    return { file, line, column, source: file };
  }

  const mapFile = file + '.map';
  
  if (!fs.existsSync(mapFile)) {
    console.log(`${indent}📍 最终位置: ${file} (${line}:${column})`);
    return { file, line, column, source: file };
  }

  try {
    const mapContent = fs.readFileSync(mapFile, 'utf8');
    const consumer = await new SourceMapConsumer(mapContent);
    
    // 转换为0基索引进行查询
    const originalPosition = consumer.originalPositionFor({
      line: line,
      column: column - 1
    });

    consumer.destroy();

    if (originalPosition.source) {
      const sourceFile = originalPosition.source;
      const sourceLine = originalPosition.line;
      const sourceColumn = originalPosition.column + 1;
      
      console.log(`${indent}✅ 映射到: ${sourceFile} (${sourceLine}:${sourceColumn})`);
      
      // 检查是否还有更深层的sourcemap
      const nextMapFile = sourceFile + '.map';
      if (fs.existsSync(nextMapFile)) {
        console.log(`${indent}🔗 发现更深层sourcemap，继续解析...`);
        return await locateOriginalPosition(sourceFile, sourceLine, sourceColumn, depth + 1);
      } else {
        console.log(`${indent}📍 最终源码位置: ${sourceFile} (${sourceLine}:${sourceColumn})`);
        return {
          file: sourceFile,
          line: sourceLine,
          column: sourceColumn,
          source: sourceFile,
          name: originalPosition.name
        };
      }
    } else {
      console.log(`${indent}❌ 无法找到源码映射`);
      return { file, line, column, source: file };
    }
  } catch (error) {
    console.log(`${indent}❌ 解析sourcemap失败: ${error.message}`);
    return { file, line, column, source: file };
  }
}

/**
 * 运行包含错误的代码并捕获错误信息
 */
function runErrorCode() {
  console.log('📋 运行包含错误的压缩代码...');
  console.log('\n');
  
  try {
    // 加载压缩后的代码
    const minifiedCode = require('./minified.js');
    
    console.log('🧪 测试1: 触发undefinedVariable错误');
    try {
      minifiedCode.calculateSum(1, 2);
    } catch (error) {
      console.log('❌ 捕获到错误:', error.message);
      
      // 从错误堆栈中提取位置信息
      const stackLines = error.stack.split('\n');
      const errorLine = stackLines.find(line => line.includes('minified.js'));
      
      if (errorLine) {
        const match = errorLine.match(/minified\.js:(\d+):(\d+)/);
        if (match) {
          const line = parseInt(match[1]);
          const column = parseInt(match[2]);
          console.log(`📍 错误位置: minified.js 第${line}行第${column}列\n`);
          
          return { file: 'minified.js', line, column, error: error.message };
        }
      }
    }
    
  } catch (error) {
    console.log('❌ 加载代码失败:', error.message);
  }
  
  return null;
}

/**
 * 主演示函数
 */
async function main() {
  // 1. 运行错误代码并捕获错误
  const errorInfo = runErrorCode();
  
  if (errorInfo) {
    console.log('🔍 开始sourcemap追溯...');
    console.log('==================================================\n');
    
    // 2. 使用sourcemap追溯到原始源码
    const originalPosition = await locateOriginalPosition(
      errorInfo.file,
      errorInfo.line,
      errorInfo.column
    );
    
    console.log('\n==================================================');
    console.log('📊 错误定位结果总结:');
    console.log('==================================================');
    console.log(`❌ 运行时错误: ${errorInfo.error}`);
    console.log(`📍 压缩代码位置: ${errorInfo.file} (${errorInfo.line}:${errorInfo.column})`);
    console.log(`📍 原始源码位置: ${originalPosition.source} (${originalPosition.line}:${originalPosition.column})`);
    if (originalPosition.name) {
      console.log(`🏷️  函数名: ${originalPosition.name}`);
    }
    
    // 3. 显示原始源码内容
    if (fs.existsSync(originalPosition.source)) {
      console.log('\n📄 原始源码内容:');
      console.log('==================================================');
      const sourceContent = fs.readFileSync(originalPosition.source, 'utf8');
      const lines = sourceContent.split('\n');
      const targetLine = originalPosition.line;
      
      // 显示错误行及其上下文
      const start = Math.max(1, targetLine - 2);
      const end = Math.min(lines.length, targetLine + 2);
      
      for (let i = start; i <= end; i++) {
        const lineContent = lines[i - 1] || '';
        const marker = i === targetLine ? '>>> ' : '    ';
        const lineNum = i.toString().padStart(3, ' ');
        console.log(`${marker}${lineNum}: ${lineContent}`);
        
        if (i === targetLine) {
          // 显示列位置指示器
          const pointer = ' '.repeat(originalPosition.column + 6) + '^';
          console.log(`    ${pointer}`);
        }
      }
    }
    
    console.log('\n✅ 错误定位演示完成!');
    console.log('\n💡 总结:');
    console.log('- 成功从压缩代码的运行时错误追溯到原始源码位置');
    console.log('- 递归解析了多层sourcemap映射关系');
    console.log('- 精确定位到了原始源码中的错误行和列');
    
  } else {
    console.log('❌ 未能捕获到有效的错误信息');
  }
}

// 运行演示
main().catch(console.error);