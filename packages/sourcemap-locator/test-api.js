const { SourcemapLocatorAPI } = require('./lib/index.js');
const path = require('path');

async function testApiRecursive() {
  console.log('=== API递归解析测试 ===\n');
  
  const locator = new SourcemapLocatorAPI();
  const sourcemapPath = path.join(__dirname, 'test-recursive/minified.js.map');
  
  try {
    // 测试递归解析
    console.log('测试位置: (1,0)');
    const result = await locator.locate(sourcemapPath, 1, 0);
    
    if (result.success && result.result) {
      console.log('\n解析结果:');
      console.log(`源文件: ${result.result.sourceFile}`);
      console.log(`行号: ${result.result.sourceLine}`);
      console.log(`列号: ${result.result.sourceColumn}`);
      console.log(`是否为原始文件: ${result.result.isOriginal}`);
      
      if (result.mappingChain && result.mappingChain.length > 0) {
        console.log('\n映射链:');
        result.mappingChain.forEach((mapping, index) => {
          console.log(`  ${index + 1}. (${mapping.inputPosition.line},${mapping.inputPosition.column}) → (${mapping.outputPosition.line},${mapping.outputPosition.column}) in ${mapping.sourceFile}`);
        });
      }
      
      // 验证是否成功递归到original.js
      if (result.result.sourceFile.endsWith('original.js')) {
        console.log('\n✅ 递归解析成功！成功追溯到原始源文件');
      } else {
        console.log('\n❌ 递归解析失败，未能追溯到原始源文件');
      }
    } else {
      console.log('\n❌ 解析失败:', result.error || '未知错误');
    }
    
  } catch (error) {
    console.error('❌ API测试失败:', error.message);
  }
}

// 运行测试
testApiRecursive().catch(console.error);