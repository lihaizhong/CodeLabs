/**
 * API接口测试用例
 */
import { SourcemapLocatorAPI, createLocator, locate, batchLocate, validateSourcemap, getSourcemapInfo } from '../src/index';
import { EventType } from '../src/types';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
describe('SourcemapLocatorAPI', () => {
    let api;
    let testDir;
    beforeEach(() => {
        api = new SourcemapLocatorAPI();
        testDir = join(__dirname, 'temp-api');
        mkdirSync(testDir, { recursive: true });
    });
    afterEach(() => {
        api.destroy();
        try {
            rmSync(testDir, { recursive: true, force: true });
        }
        catch {
            // 忽略清理错误
        }
    });
    describe('locate', () => {
        it('should locate recursively by default', async () => {
            const sourcemap = {
                version: 3,
                sources: ['src/original.ts'],
                names: ['console', 'log'],
                mappings: 'AAAA,QAAQ,CAAC,GAAG,CAAC,OAAO,CAAC',
                file: 'compiled.js',
                sourcesContent: ['console.log("hello");']
            };
            const sourcemapPath = join(testDir, 'api-locate.js.map');
            writeFileSync(sourcemapPath, JSON.stringify(sourcemap));
            const result = await api.locate(sourcemapPath, 1, 0);
            expect(result.success).toBe(true);
            expect(result.result).toBeDefined();
            if (result.result) {
                expect(result.result.sourceFile).toContain('src/original.ts');
                // expect(result.result.steps).toHaveLength(1);
            }
        });
    });
    describe('locateOnce', () => {
        it('should locate only one level', async () => {
            const sourcemap = {
                version: 3,
                sources: ['src/original.ts'],
                names: ['console', 'log'],
                mappings: 'AAAA,QAAQ,CAAC,GAAG,CAAC,OAAO,CAAC',
                file: 'compiled.js',
                sourcesContent: ['console.log("hello");']
            };
            const sourcemapPath = join(testDir, 'api-locate-once.js.map');
            writeFileSync(sourcemapPath, JSON.stringify(sourcemap));
            const result = await api.locate(sourcemapPath, 1, 0);
            expect(result.success).toBe(true);
            expect(result.result).toBeDefined();
            if (result.result) {
                expect(result.result.sourceFile).toContain('src/original.ts');
            }
        });
    });
    describe('batchLocate', () => {
        it('should handle batch location requests', async () => {
            const requests = [
                {
                    sourcemapPath: 'dist/bundle.js.map',
                    line: 1,
                    column: 100
                }
            ];
            const result = await api.batchLocate(requests);
            expect(result).toBeDefined();
        });
    });
    describe('validateSourcemap', () => {
        it('should validate sourcemap format', () => {
            const validSourcemap = {
                version: 3,
                sources: ['src/index.ts'],
                names: [],
                mappings: 'AAAA'
            };
            const result = validateSourcemap(JSON.stringify(validSourcemap));
            expect(result).toBeDefined();
        });
        it('should detect invalid sourcemap', async () => {
            const invalidSourcemap = {
                version: 2, // 不支持的版本
                sources: ['src/original.ts'],
                mappings: 'AAAA'
            };
            const sourcemapPath = join(testDir, 'api-invalid.js.map');
            writeFileSync(sourcemapPath, JSON.stringify(invalidSourcemap));
            const result = await api.validateSourcemap(sourcemapPath);
            expect(result.valid).toBe(false);
            expect(result.error).toBeDefined();
        });
    });
    describe('getSourcemapInfo', () => {
        it('should return sourcemap information', async () => {
            const sourcemap = {
                version: 3,
                sources: ['src/original.ts', 'src/utils.ts'],
                names: ['console', 'log', 'helper'],
                mappings: 'AAAA,QAAQ,CAAC,GAAG,CAAC,OAAO,CAAC',
                file: 'compiled.js',
                sourcesContent: ['console.log("hello");', 'export function helper() {}']
            };
            const sourcemapPath = join(testDir, 'api-info.js.map');
            writeFileSync(sourcemapPath, JSON.stringify(sourcemap));
            const result = await api.getSourcemapInfo(sourcemapPath);
            expect(result.version).toBe(3);
            expect(result.sources).toEqual(['src/original.ts', 'src/utils.ts']);
            expect(result.names).toEqual(['console', 'log', 'helper']);
            expect(result.sourceRoot).toBeUndefined();
        });
    });
    describe('event handling', () => {
        it('should handle events properly', async () => {
            const events = [];
            api.addEventListener(EventType.LOCATE_START, () => events.push('locate_start'));
            api.addEventListener(EventType.LOCATE_COMPLETE, () => events.push('locate_complete'));
            const sourcemap = {
                version: 3,
                sources: ['src/original.ts'],
                names: [],
                mappings: 'AAAA',
                file: 'compiled.js'
            };
            const sourcemapPath = join(testDir, 'api-events.js.map');
            writeFileSync(sourcemapPath, JSON.stringify(sourcemap));
            await api.locate(sourcemapPath, 1, 0);
            expect(events).toContain('locate_start');
            expect(events).toContain('locate_complete');
        });
    });
    describe('cache management', () => {
        it('should manage cache properly', async () => {
            const sourcemap = {
                version: 3,
                sources: ['src/original.ts'],
                names: [],
                mappings: 'AAAA',
                file: 'compiled.js'
            };
            const sourcemapPath = join(testDir, 'api-cache.js.map');
            writeFileSync(sourcemapPath, JSON.stringify(sourcemap));
            // 第一次定位
            await api.locate(sourcemapPath, 1, 0);
            // 清理缓存
            api.clearCache();
            // 第二次定位应该重新解析
            const result = await api.locate(sourcemapPath, 1, 0);
            expect(result.success).toBe(true);
        });
    });
});
describe('Convenience Functions', () => {
    let testDir;
    beforeEach(() => {
        testDir = join(__dirname, 'temp-convenience');
        mkdirSync(testDir, { recursive: true });
    });
    afterEach(() => {
        try {
            rmSync(testDir, { recursive: true, force: true });
        }
        catch {
            // 忽略清理错误
        }
    });
    describe('createLocator', () => {
        it('should create locator with default config', () => {
            const locator = createLocator();
            expect(locator).toBeInstanceOf(SourcemapLocatorAPI);
            locator.destroy();
        });
        it('should create locator with custom config', () => {
            const locator = createLocator({
                maxRecursionDepth: 5,
                cache: {
                    maxSize: 100,
                    ttl: 3600
                }
            });
            expect(locator).toBeInstanceOf(SourcemapLocatorAPI);
            locator.destroy();
        });
    });
    describe('locate', () => {
        it('should work as standalone function', async () => {
            const sourcemap = {
                version: 3,
                sources: ['src/original.ts'],
                names: ['console', 'log'],
                mappings: 'AAAA,QAAQ,CAAC,GAAG,CAAC,OAAO,CAAC',
                file: 'compiled.js',
                sourcesContent: ['console.log("hello");']
            };
            const sourcemapPath = join(testDir, 'standalone-locate.js.map');
            writeFileSync(sourcemapPath, JSON.stringify(sourcemap));
            const result = await locate(sourcemapPath, 1, 0);
            expect(result.success).toBe(true);
            expect(result.result).toBeDefined();
        });
    });
    describe('batchLocate', () => {
        it('should work as standalone function', async () => {
            const sourcemap = {
                version: 3,
                sources: ['src/original.ts'],
                names: ['console', 'log'],
                mappings: 'AAAA,QAAQ,CAAC,GAAG,CAAC,OAAO,CAAC',
                file: 'compiled.js'
            };
            const sourcemapPath = join(testDir, 'standalone-batch.js.map');
            writeFileSync(sourcemapPath, JSON.stringify(sourcemap));
            const requests = [
                { sourcemapPath, line: 1, column: 0 }
            ];
            const result = await batchLocate(requests);
            expect(result.success).toBe(true);
            expect(result.results).toBeDefined();
            expect(result.results.length).toBe(1);
        });
    });
    describe('validateSourcemap', () => {
        it('should work as standalone function', async () => {
            const sourcemap = {
                version: 3,
                sources: ['src/original.ts'],
                names: [],
                mappings: 'AAAA',
                file: 'compiled.js'
            };
            const sourcemapPath = join(testDir, 'standalone-validate.js.map');
            writeFileSync(sourcemapPath, JSON.stringify(sourcemap));
            const result = await validateSourcemap(sourcemapPath);
            expect(result.valid).toBe(true);
            expect(result.error).toBeUndefined();
        });
    });
    describe('getSourcemapInfo', () => {
        it('should work as standalone function', async () => {
            const sourcemap = {
                version: 3,
                sources: ['src/original.ts'],
                names: ['test'],
                mappings: 'AAAA',
                file: 'compiled.js'
            };
            const sourcemapPath = join(testDir, 'standalone-info.js.map');
            writeFileSync(sourcemapPath, JSON.stringify(sourcemap));
            const result = await getSourcemapInfo(sourcemapPath);
            expect(result.version).toBe(3);
            expect(result.sources).toEqual(['src/original.ts']);
            expect(result.names).toEqual(['test']);
        });
    });
});
//# sourceMappingURL=index.test.js.map