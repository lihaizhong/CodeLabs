#!/usr/bin/env node

/**
 * Sourcemap Locator CLI 工具入口文件
 * 这是编译后的JavaScript版本，用于npm包的bin字段
 */

// 导入编译后的主模块
const { SourcemapLocatorAPI } = require('../lib/index.js');
const { Command } = require('commander');
const chalk = require('chalk');
const { existsSync, readFileSync } = require('fs');
const { resolve } = require('path');

/**
 * CLI应用程序类
 */
class SourcemapLocatorCLI {
  constructor() {
    this.program = new Command();
    this.setupCommands();
  }

  /**
   * 设置命令行命令
   */
  setupCommands() {
    this.program
      .name('sourcemap-locator')
      .description('A tool for locating original source code positions through multiple layers of sourcemaps')
      .version(this.getVersion());

    // locate命令 - 单个位置定位
    this.program
      .command('locate')
      .description('Locate original source position for a given position in generated code')
      .argument('<sourcemap>', 'Path to the sourcemap file')
      .argument('<line>', 'Line number (1-based)', this.parseInteger)
      .argument('<column>', 'Column number (0-based)', this.parseInteger)
      .option('-r, --recursive', 'Enable recursive sourcemap resolution', true)
      .option('-d, --max-depth <depth>', 'Maximum recursion depth', this.parseInteger, 10)
      .option('-v, --verbose', 'Enable verbose output', false)
      .option('--format <format>', 'Output format (json|table|simple)', 'table')
      .action(this.handleLocateCommand.bind(this));

    // validate命令 - 验证sourcemap文件
    this.program
      .command('validate')
      .description('Validate sourcemap file format and structure')
      .argument('<sourcemap>', 'Path to the sourcemap file')
      .option('-v, --verbose', 'Enable verbose output', false)
      .action(this.handleValidateCommand.bind(this));
  }

  /**
   * 处理locate命令
   */
  async handleLocateCommand(sourcemap, line, column, options) {
    try {
      const sourcemapPath = resolve(sourcemap);
      
      if (!existsSync(sourcemapPath)) {
        this.error(`Sourcemap file not found: ${sourcemapPath}`);
        return;
      }

      const api = new SourcemapLocatorAPI({
        maxRecursionDepth: options.maxDepth || 10
      });

      const result = await api.locate(sourcemapPath, line, column);

      if (result.success && result.result) {
        this.outputLocateResult(result, options.format);
      } else {
        this.error(`Failed to locate position: ${result.error}`);
      }

      api.destroy();
    } catch (error) {
      this.error(`Unexpected error: ${error.message}`);
    }
  }

  /**
   * 处理validate命令
   */
  async handleValidateCommand(sourcemap, options) {
    try {
      const sourcemapPath = resolve(sourcemap);
      
      if (!existsSync(sourcemapPath)) {
        this.error(`Sourcemap file not found: ${sourcemapPath}`);
        return;
      }

      const api = new SourcemapLocatorAPI();
      const isValid = await api.validateSourcemap(sourcemapPath);
      
      if (isValid) {
        console.log(chalk.green('✓ Sourcemap file is valid'));
      } else {
        this.error('Invalid sourcemap file');
      }

      api.destroy();
    } catch (error) {
      this.error(`Invalid sourcemap: ${error.message}`);
    }
  }

  /**
   * 输出单个定位结果
   */
  outputLocateResult(result, format) {
    const location = result.result;
    
    switch (format) {
      case 'json':
        console.log(JSON.stringify(result, null, 2));
        break;
      case 'simple':
        console.log(`${location.sourceFile}:${location.sourceLine}:${location.sourceColumn}`);
        break;
      case 'table':
      default:
        console.log(chalk.bold('Location Result:'));
        console.log(`Source File: ${chalk.cyan(location.sourceFile)}`);
        console.log(`Line: ${chalk.yellow(location.sourceLine)}`);
        console.log(`Column: ${chalk.yellow(location.sourceColumn)}`);
        
        if (location.mappingSteps && location.mappingSteps.length > 0) {
          console.log(chalk.bold('\nMapping Chain:'));
          location.mappingSteps.forEach((step, index) => {
            console.log(`  ${index + 1}. (${step.inputPosition.line},${step.inputPosition.column}) → (${step.outputPosition.line},${step.outputPosition.column}) in ${step.sourceFile.split('/').pop()}`);
          });
        }
        break;
    }
  }

  /**
   * 解析整数参数
   */
  parseInteger(value) {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      throw new Error(`Invalid number: ${value}`);
    }
    return parsed;
  }

  /**
   * 获取版本号
   */
  getVersion() {
    try {
      const packagePath = resolve(__dirname, '../package.json');
      const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));
      return packageJson.version || '1.0.0';
    } catch {
      return '1.0.0';
    }
  }

  /**
   * 输出错误信息并退出
   */
  error(message) {
    console.error(chalk.red('Error:'), message);
    process.exit(1);
  }

  /**
   * 运行CLI应用程序
   */
  run() {
    this.program.parse();
  }
}

// 运行CLI应用程序
if (require.main === module) {
  const cli = new SourcemapLocatorCLI();
  cli.run();
}