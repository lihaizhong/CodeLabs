/**
 * Sourcemap Locator CLI 工具入口文件
 * 这是编译后的JavaScript版本，用于npm包的bin字段
 */

// 导入编译后的主模块
import { Command } from "commander";
import chalk from "chalk";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { LocateResult, MappingStep } from "./types";
import { SourcemapParser } from "./parser";
import { RecursiveLocator } from "./recursive-locator";

/**
 * CLI应用程序类
 */
export class SourcemapLocatorCLI {
  private program: Command;

  constructor() {
    this.program = new Command();
    this.setupCommands();
  }

  /**
   * 设置命令行命令
   */
  private setupCommands() {
    this.program
      .name("sourcemap-locator")
      .description(
        "A tool for locating original source code positions through multiple layers of sourcemaps"
      )
      .version(this.getVersion());

    // locate命令 - 单个位置定位
    this.program
      .command("locate")
      .description(
        "Locate original source position for a given position in generated code"
      )
      .argument("<sourcemap>", "Path to the sourcemap file")
      .argument("<line>", "Line number (1-based)", this.parseInteger)
      .argument("<column>", "Column number (0-based)", this.parseInteger)
      .option("-r, --recursive", "Enable recursive sourcemap resolution", true)
      .option(
        "-d, --max-depth <depth>",
        "Maximum recursion depth",
        this.parseInteger,
        10
      )
      .option("-v, --verbose", "Enable verbose output", false)
      .option("--format <format>", "Output format (json|table|simple)", "table")
      .action(this.handleLocateCommand.bind(this));

    // validate命令 - 验证sourcemap文件
    this.program
      .command("validate")
      .description("Validate sourcemap file format and structure")
      .argument("<sourcemap>", "Path to the sourcemap file")
      .option("-v, --verbose", "Enable verbose output", false)
      .action(this.handleValidateCommand.bind(this));
  }

  /**
   * 处理locate命令
   */
  async handleLocateCommand(
    sourcemap: string,
    line: number,
    column: number,
    options: {
      recursive: boolean;
      maxDepth: number;
      verbose: boolean;
      format: string;
    }
  ) {
    try {
      const sourcemapPath = resolve(sourcemap);

      if (!existsSync(sourcemapPath)) {
        this.error(`Sourcemap file not found: ${sourcemapPath}`);
        return;
      }

      const locator = new RecursiveLocator({
        maxRecursionDepth: options.maxDepth || 10,
      });

      const result = await locator.locateRecursively({
        sourcemapPath,
        line,
        column
      });

      if (result.success && result.result) {
        this.outputLocateResult(result, options.format);
      } else {
        this.error(`Failed to locate position: ${result.error}`);
      }

      locator.destroy();
    } catch (error: unknown) {
      this.error(
        `Unexpected error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * 处理validate命令
   */
  async handleValidateCommand(sourcemap: string) {
    try {
      const sourcemapPath = resolve(sourcemap);

      if (!existsSync(sourcemapPath)) {
        this.error(`Sourcemap file not found: ${sourcemapPath}`);
        return;
      }

      const parser = new SourcemapParser();
      
      try {
        const consumer = await parser.parseSourcemap(sourcemapPath);
        consumer.destroy();
        console.log(chalk.green("✓ Sourcemap file is valid"));
      } catch (error) {
        this.error(`Invalid sourcemap file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      parser.destroy();
    } catch (error: unknown) {
      this.error(
        `Invalid sourcemap: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * 输出单个定位结果
   */
  outputLocateResult(result: LocateResult, format: string): void {
    const location = result.result;

    if (!location) {
      console.error(chalk.red("No location result found"));
      return;
    }

    switch (format) {
      case "json":
        console.log(JSON.stringify(result, null, 2));
        break;
      case "simple":
        console.log(
          `${location.sourceFile}:${location.sourceLine}:${location.sourceColumn}`
        );
        break;
      case "table":
      default:
        console.log(chalk.bold("Location Result:"));
        console.log(`Source File: ${chalk.cyan(location.sourceFile)}`);
        console.log(`Line: ${chalk.yellow(location.sourceLine)}`);
        console.log(`Column: ${chalk.yellow(location.sourceColumn)}`);

        if (location.mappingSteps && location.mappingSteps.length > 0) {
          console.log(chalk.bold("\nMapping Chain:"));
          location.mappingSteps.forEach((step: MappingStep, index: number) => {
            console.log(
              `  ${index + 1}. (${step.inputPosition.line},${
                step.inputPosition.column
              }) → (${step.outputPosition.line},${
                step.outputPosition.column
              }) in ${step.sourceFile.split("/").pop()}`
            );
          });
        }
        break;
    }
  }

  /**
   * 解析整数参数
   */
  parseInteger(value: string): number {
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
      const packagePath = resolve(__dirname, "../package.json");
      const packageJson = JSON.parse(readFileSync(packagePath, "utf-8"));
      return packageJson.version || "1.0.0";
    } catch {
      return "1.0.0";
    }
  }

  /**
   * 输出错误信息并退出
   */
  error(message: string): void {
    console.error(chalk.red("Error:"), message);
    process.exit(1);
  }

  /**
   * 运行CLI应用程序
   */
  run() {
    this.program.parse();
  }
}
