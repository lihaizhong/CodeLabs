import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';
import dts from 'rollup-plugin-dts';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pkg = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf8'));

/**
 * 创建基础的Rollup配置
 * @param {Object} options - 配置选项
 * @param {string} options.format - 输出格式 (esm, cjs, umd)
 * @param {string} options.file - 输出文件路径
 * @param {boolean} options.minify - 是否压缩代码
 * @returns {Object} Rollup配置对象
 */
function createConfig({ format, file, minify = false }) {
  const isUMD = format === 'umd';
  
  return {
    input: 'src/index.ts',
    output: {
      file,
      format,
      name: isUMD ? 'SourcemapLocator' : undefined,
      sourcemap: true,
      exports: 'named'
    },
    external: isUMD ? [] : ['source-map', 'commander', 'fs', 'path', 'url'],
    plugins: [
      replace({
        preventAssignment: true,
        __VERSION__: JSON.stringify(pkg.version)
      }),
      resolve({
        preferBuiltins: true,
        browser: isUMD
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationMap: false,
        sourceMap: true
      }),
      minify && terser({
        compress: {
          drop_console: true,
          drop_debugger: true
        },
        mangle: {
          reserved: ['SourcemapLocator']
        }
      })
    ].filter(Boolean)
  };
}

/**
 * 创建类型声明文件的配置
 * @returns {Object} 类型声明的Rollup配置
 */
function createDtsConfig() {
  return {
    input: 'src/index.ts',
    output: {
      file: 'index.d.ts',
      format: 'es'
    },
    plugins: [
      dts({
        respectExternal: true
      })
    ],
    external: ['source-map', 'commander', 'fs', 'path', 'url']
  };
}

export default [
  // ESM build
  createConfig({
    format: 'esm',
    file: 'esm/index.js'
  }),
  
  // CommonJS build
  createConfig({
    format: 'cjs',
    file: 'lib/index.js'
  }),
  
  // UMD build (minified)
  createConfig({
    format: 'umd',
    file: 'lib/index.min.js',
    minify: true
  }),
  
  // TypeScript declarations
  createDtsConfig()
];