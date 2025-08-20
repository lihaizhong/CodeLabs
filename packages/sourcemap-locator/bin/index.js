#!/usr/bin/env node

/**
 * Sourcemap Locator CLI 工具入口文件
 * 这是编译后的JavaScript版本，用于npm包的bin字段
 */

// 导入编译后的主模块
import { SourcemapLocatorCLI } from '../esm/index.js';
import { fileURLToPath } from 'url';

// 运行CLI应用程序
const __filename = fileURLToPath(import.meta.url);

if (process.argv[1] === __filename) {
  const cli = new SourcemapLocatorCLI();
  cli.run();
}
