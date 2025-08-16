#!/usr/bin/env node

/**
 * 演示如何使用sourcemap-locator CLI工具定位运行时错误
 * 这个脚本展示了从压缩代码的错误位置追溯到原始源码的完整流程
 */

const { exec } = require('child_process');
const path = require('path');

// 获取CLI工具路径
const cliPath = path.join(__dirname, '..', 'bin', 'index.js');

console.log('🚀 sourcemap-locator 错误定位演示');
console.log('==================================================\n');

/**
 * 执行CLI命令并返回结果
 * @param {string} command - 要执行的命令
 * @returns {Promise<string>} 命令输出结果
 */
function runCLI(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
}

/**
 * 演示CLI工具的错误定位功能
 */
async function demonstrateCLI() {
  try {
    console.log('📍 演示1: 定位minified.js中第1行第54列的错误');
    console.log('命令: node ../bin/index.js locate minified.js 1 54 --recursive');
    
    const result1 = await runCLI(`node ${cliPath} locate minified.js 1 54 --recursive`);
    console.log('结果:');
    console.log(result1);
    console.log('\n' + '='.repeat(50) + '\n');

    console.log('📍 演示2: 定位minified.js中第1行第119列的错误');
    console.log('命令: node ../bin/index.js locate minified.js 1 119 --recursive');
    
    const result2 = await runCLI(`node ${cliPath} locate minified.js 1 119 --recursive`);
    console.log('结果:');
    console.log(result2);
    console.log('\n' + '='.repeat(50) + '\n');

    console.log('📍 演示3: 定位minified.js中第1行第277列的错误');
    console.log('命令: node ../bin/index.js locate minified.js 1 277 --recursive');
    
    const result3 = await runCLI(`node ${cliPath} locate minified.js 1 277 --recursive`);
    console.log('结果:');
    console.log(result3);
    console.log('\n' + '='.repeat(50) + '\n');

    console.log('📍 演示4: 定位minified.js中第1行第197列的错误');
    console.log('命令: node ../bin/index.js locate minified.js 1 197 --recursive');
    
    const result4 = await runCLI(`node ${cliPath} locate minified.js 1 197 --recursive`);
    console.log('结果:');
    console.log(result4);

    console.log('\n✅ CLI工具演示完成!');
    console.log('\n💡 使用说明:');
    console.log('- 使用 --recursive 参数启用递归解析');
    console.log('- 使用 --max-depth 参数限制递归深度');
    console.log('- CLI工具会自动追溯sourcemap链，直到找到最终的原始源码位置');
    
  } catch (error) {
    console.error('❌ CLI演示失败:', error.message);
  }
}

// 运行演示
demonstrateCLI();