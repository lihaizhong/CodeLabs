/**
 * 递归定位器测试用例
 */
import { RecursiveLocator } from '../src/recursive-locator';
import { EventType } from '../src/types';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
describe('RecursiveLocator', () => {
    let locator;
    let testDir;
    beforeEach(() => {
        locator = new RecursiveLocator();
        testDir = join(__dirname, 'temp-recursive');
        mkdirSync(testDir, { recursive: true });
    });
    afterEach(() => {
        locator.destroy();
        try {
            rmSync(testDir, { recursive: true, force: true });
        }
        catch {
            // 忽略清理错误
        }
    });
    describe('locateRecursively', () => {
        it('should locate through single sourcemap', async () => {
            // 创建单层sourcemap
            const sourcemap = {
                version: 3,
                sources: ['src/original.ts'],
                names: ['console', 'log'],
                mappings: 'AAAA,QAAQ,CAAC,GAAG,CAAC,OAAO,CAAC',
                file: 'compiled.js',
                sourcesContent: ['console.log("hello");']
            };
            const sourcemapPath = join(testDir, 'single.js.map');
            writeFileSync(sourcemapPath, JSON.stringify(sourcemap));
            const result = await locator.locateRecursively({
                sourcemapPath,
                line: 1,
                column: 0
            });
            expect(result).toBeDefined();
        });
        it('should locate through multiple sourcemaps', async () => {
            // 创建第一层sourcemap (TypeScript -> ES6)
            const sourcemap1 = {
                version: 3,
                sources: ['src/original.ts'],
                names: ['console', 'log'],
                mappings: 'AAAA,QAAQ,CAAC,GAAG,CAAC,OAAO,CAAC',
                file: 'es6.js',
                sourcesContent: ['console.log("hello");']
            };
            // 创建第二层sourcemap (ES6 -> ES5)
            const sourcemap2 = {
                version: 3,
                sources: ['es6.js'],
                names: ['console', 'log'],
                mappings: 'AAAA,QAAQ,CAAC,GAAG,CAAC,OAAO,CAAC',
                file: 'es5.js',
                sourcesContent: ['console.log("hello");']
            };
            const sourcemap1Path = join(testDir, 'es6.js.map');
            const sourcemap2Path = join(testDir, 'es5.js.map');
            const es6Path = join(testDir, 'es6.js');
            writeFileSync(sourcemap1Path, JSON.stringify(sourcemap1));
            writeFileSync(sourcemap2Path, JSON.stringify(sourcemap2));
            writeFileSync(es6Path, `console.log("hello");\n//# sourceMappingURL=es6.js.map`);
            const result = await locator.locateRecursively({
                sourcemapPath: sourcemap2Path,
                line: 1,
                column: 0
            });
            expect(result).toBeDefined();
        });
        it('should handle circular references', async () => {
            // 创建循环引用的sourcemap
            const sourcemap1 = {
                version: 3,
                sources: ['file2.js'],
                names: [],
                mappings: 'AAAA',
                file: 'file1.js'
            };
            const sourcemap2 = {
                version: 3,
                sources: ['file1.js'],
                names: [],
                mappings: 'AAAA',
                file: 'file2.js'
            };
            const sourcemap1Path = join(testDir, 'file1.js.map');
            const sourcemap2Path = join(testDir, 'file2.js.map');
            const file1Path = join(testDir, 'file1.js');
            const file2Path = join(testDir, 'file2.js');
            writeFileSync(sourcemap1Path, JSON.stringify(sourcemap1));
            writeFileSync(sourcemap2Path, JSON.stringify(sourcemap2));
            writeFileSync(file1Path, `//# sourceMappingURL=file1.js.map`);
            writeFileSync(file2Path, `//# sourceMappingURL=file2.js.map`);
            const result = await locator.locateRecursively({
                sourcemapPath: sourcemap1Path,
                line: 1,
                column: 0
            });
            expect(result).toBeDefined();
        });
        it('should respect max depth limit', async () => {
            // 创建深层嵌套的sourcemap链
            const sourcemaps = [];
            const sourcemapPaths = [];
            const filePaths = [];
            for (let i = 0; i < 15; i++) {
                const nextFile = i === 14 ? 'original.ts' : `level${i + 1}.js`;
                const sourcemap = {
                    version: 3,
                    sources: [nextFile],
                    names: [],
                    mappings: 'AAAA',
                    file: `level${i}.js`
                };
                sourcemaps.push(sourcemap);
                const sourcemapPath = join(testDir, `level${i}.js.map`);
                const filePath = join(testDir, `level${i}.js`);
                sourcemapPaths.push(sourcemapPath);
                filePaths.push(filePath);
                writeFileSync(sourcemapPath, JSON.stringify(sourcemap));
                if (i < 14) {
                    writeFileSync(filePath, `//# sourceMappingURL=level${i}.js.map`);
                }
            }
            const result = await locator.locateRecursively({
                sourcemapPath: sourcemapPaths[0],
                line: 1,
                column: 0
            });
            expect(result).toBeDefined();
        });
        it('should handle missing intermediate files gracefully', async () => {
            const sourcemap = {
                version: 3,
                sources: ['non-existent.js'],
                names: [],
                mappings: 'AAAA',
                file: 'compiled.js'
            };
            const sourcemapPath = join(testDir, 'missing-source.js.map');
            writeFileSync(sourcemapPath, JSON.stringify(sourcemap));
            const result = await locator.locateRecursively({
                sourcemapPath,
                line: 1,
                column: 0
            });
            expect(result).toBeDefined();
        });
    });
    describe('batchLocateRecursively', () => {
        it('should process multiple locations', async () => {
            const sourcemap = {
                version: 3,
                sources: ['src/original.ts'],
                names: ['console', 'log', 'error'],
                mappings: 'AAAA,QAAQ,CAAC,GAAG,CAAC,OAAO,CAAC;AACA,QAAQ,CAAC,KAAK,CAAC,OAAO,CAAC',
                file: 'compiled.js',
                sourcesContent: ['console.log("hello");\nconsole.error("error");']
            };
            const sourcemapPath = join(testDir, 'batch.js.map');
            writeFileSync(sourcemapPath, JSON.stringify(sourcemap));
            const requests = [
                { sourcemapPath, line: 1, column: 0 },
                { sourcemapPath, line: 2, column: 0 }
            ];
            const result = await locator.batchLocateRecursively({ locations: requests });
            expect(result).toBeDefined();
        });
        it('should handle mixed success and failure', async () => {
            const sourcemap = {
                version: 3,
                sources: ['src/original.ts'],
                names: [],
                mappings: 'AAAA',
                file: 'compiled.js'
            };
            const sourcemapPath = join(testDir, 'mixed.js.map');
            const nonExistentPath = join(testDir, 'non-existent.js.map');
            writeFileSync(sourcemapPath, JSON.stringify(sourcemap));
            const requests = [
                { sourcemapPath, line: 1, column: 0 },
                { sourcemapPath: nonExistentPath, line: 1, column: 0 }
            ];
            const result = await locator.batchLocateRecursively({ locations: requests });
            expect(result).toBeDefined();
        });
    });
    describe('event handling', () => {
        it('should emit events during recursive location', async () => {
            const events = [];
            locator.addEventListener(EventType.LOCATE_START, () => events.push('locate_start'));
            locator.addEventListener(EventType.STEP_COMPLETE, () => events.push('step_complete'));
            locator.addEventListener(EventType.LOCATE_COMPLETE, () => events.push('locate_complete'));
            const sourcemap = {
                version: 3,
                sources: ['src/original.ts'],
                names: [],
                mappings: 'AAAA',
                file: 'compiled.js'
            };
            const sourcemapPath = join(testDir, 'events.js.map');
            writeFileSync(sourcemapPath, JSON.stringify(sourcemap));
            await locator.locateRecursively({
                sourcemapPath,
                line: 1,
                column: 0
            });
            expect(events).toContain('locate_start');
            expect(events).toContain('step_complete');
            expect(events).toContain('locate_complete');
        });
    });
    describe('cache management', () => {
        it('should clear cache properly', async () => {
            const sourcemap = {
                version: 3,
                sources: ['src/original.ts'],
                names: [],
                mappings: 'AAAA',
                file: 'compiled.js'
            };
            const sourcemapPath = join(testDir, 'cache.js.map');
            writeFileSync(sourcemapPath, JSON.stringify(sourcemap));
            // 第一次定位
            await locator.locateRecursively({
                sourcemapPath,
                line: 1,
                column: 0
            });
            // 清理缓存
            locator.clearCache();
            // 第二次定位应该重新解析
            const result = await locator.locateRecursively({
                sourcemapPath,
                line: 1,
                column: 0
            });
            expect(result.success).toBe(true);
        });
    });
});
//# sourceMappingURL=recursive-locator.test.js.map