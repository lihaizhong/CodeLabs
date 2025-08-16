/**
 * 分析minified.js中各个错误位置的精确坐标
 */

const fs = require('fs');

// 读取minified.js文件
const minifiedCode = fs.readFileSync('minified.js', 'utf8');

console.log('🔍 分析minified.js中的错误位置');
console.log('文件内容长度:', minifiedCode.length);
console.log('\n文件内容:');
console.log(minifiedCode);
console.log('\n');

// 查找关键错误位置
const errorPatterns = [
  { name: 'undefinedVariable', pattern: 'undefinedVariable' },
  { name: 'nonExistentMethod', pattern: 'nonExistentMethod' },
  { name: 'someProperty', pattern: 'someProperty' },
  { name: 'Error throw', pattern: 'throw new Error' }
];

errorPatterns.forEach(({ name, pattern }) => {
  const index = minifiedCode.indexOf(pattern);
  if (index !== -1) {
    // 计算行号和列号
    const beforeText = minifiedCode.substring(0, index);
    const lines = beforeText.split('\n');
    const line = lines.length;
    const column = lines[lines.length - 1].length + 1;
    
    console.log(`📍 ${name}:`);
    console.log(`   位置: 第${line}行，第${column}列`);
    console.log(`   索引: ${index}`);
    console.log(`   上下文: ...${minifiedCode.substring(Math.max(0, index-20), index+20)}...`);
    console.log('');
  } else {
    console.log(`❌ 未找到: ${name}`);
  }
});

// 生成CLI测试命令
console.log('\n🚀 CLI测试命令:');
errorPatterns.forEach(({ name, pattern }) => {
  const index = minifiedCode.indexOf(pattern);
  if (index !== -1) {
    const beforeText = minifiedCode.substring(0, index);
    const lines = beforeText.split('\n');
    const line = lines.length;
    const column = lines[lines.length - 1].length + 1;
    
    console.log(`# ${name}`);
    console.log(`node ../bin/index.js locate minified.js ${line} ${column} --recursive`);
    console.log('');
  }
});