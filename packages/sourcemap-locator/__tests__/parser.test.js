/**
 * Sourcemap解析器测试用例
 */
import { SourcemapParser } from '../src/parser';
import { SourcemapLocatorError, EventType } from '../src/types';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
describe('SourcemapParser', () => {
    let parser;
    let testDir;
    beforeEach(() => {
        parser = new SourcemapParser();
        testDir = join(__dirname, 'temp');
        mkdirSync(testDir, { recursive: true });
    });
    afterEach(() => {
        parser.destroy();
        try {
            rmSync(testDir, { recursive: true, force: true });
        }
        catch {
            // 忽略清理错误
        }
    });
    describe('parseSourcemap', () => {
        it('should parse valid sourcemap file', async () => {
            const sourcemap = {
                version: 3,
                sources: ['src/index.ts'],
                names: ['console', 'log'],
                mappings: 'AAAA,OAAO,CAAC,GAAG,CAAC,YAAY,CAAC,CAAC',
                file: 'index.js'
            };
            const sourcemapPath = join(testDir, 'test.js.map');
            writeFileSync(sourcemapPath, JSON.stringify(sourcemap));
            const consumer = await parser.parseSourcemap(sourcemapPath);
            expect(consumer).toBeDefined();
            expect(consumer.hasContentsOfAllSources()).toBe(false);
            consumer.destroy();
        });
        it('should throw error for non-existent file', async () => {
            const nonExistentPath = join(testDir, 'non-existent.js.map');
            await expect(parser.parseSourcemap(nonExistentPath))
                .rejects
                .toThrow(SourcemapLocatorError);
        });
        it('should throw error for invalid JSON', async () => {
            const invalidPath = join(testDir, 'invalid.js.map');
            writeFileSync(invalidPath, 'invalid json content');
            await expect(parser.parseSourcemap(invalidPath))
                .rejects
                .toThrow(SourcemapLocatorError);
        });
        it('should throw error for missing required fields', async () => {
            const invalidSourcemap = {
                version: 3
                // 缺少 sources 和 mappings
            };
            const sourcemapPath = join(testDir, 'invalid.js.map');
            writeFileSync(sourcemapPath, JSON.stringify(invalidSourcemap));
            await expect(parser.parseSourcemap(sourcemapPath))
                .rejects
                .toThrow(SourcemapLocatorError);
        });
        it('should throw error for unsupported version', async () => {
            const unsupportedSourcemap = {
                version: 2,
                sources: ['src/index.ts'],
                mappings: 'AAAA'
            };
            const sourcemapPath = join(testDir, 'unsupported.js.map');
            writeFileSync(sourcemapPath, JSON.stringify(unsupportedSourcemap));
            await expect(parser.parseSourcemap(sourcemapPath))
                .rejects
                .toThrow(SourcemapLocatorError);
        });
        it('should use cache for repeated requests', async () => {
            const sourcemap = {
                version: 3,
                sources: ['src/index.ts'],
                names: [],
                mappings: 'AAAA',
                file: 'index.js'
            };
            const sourcemapPath = join(testDir, 'cached.js.map');
            writeFileSync(sourcemapPath, JSON.stringify(sourcemap));
            // 第一次解析
            const consumer1 = await parser.parseSourcemap(sourcemapPath);
            // 第二次解析应该使用缓存
            const consumer2 = await parser.parseSourcemap(sourcemapPath);
            expect(consumer1).toBe(consumer2);
            consumer1.destroy();
        });
    });
    describe('locate', () => {
        it('should locate original position successfully', async () => {
            // 创建一个简单的sourcemap用于测试
            const sourcemap = {
                version: 3,
                sources: ['src/index.ts'],
                names: ['console', 'log', 'hello'],
                mappings: 'AAAA,QAAQ,CAAC,GAAG,CAAC,OAAO,CAAC',
                file: 'index.js',
                sourcesContent: ['console.log("hello");']
            };
            const sourcemapPath = join(testDir, 'locate.js.map');
            writeFileSync(sourcemapPath, JSON.stringify(sourcemap));
            const result = await parser.locate({
                sourcemapPath,
                line: 1,
                column: 0
            });
            expect(result.success).toBe(true);
            expect(result.result).toBeDefined();
            if (result.result) {
                expect(result.result.sourceFile).toContain('src/index.ts');
                expect(result.result.sourceLine).toBeGreaterThan(0);
                expect(result.result.sourceColumn).toBeGreaterThanOrEqual(0);
            }
        });
        it('should return error for invalid position', async () => {
            const sourcemap = {
                version: 3,
                sources: ['src/index.ts'],
                names: [],
                mappings: 'AAAA',
                file: 'index.js'
            };
            const sourcemapPath = join(testDir, 'invalid-pos.js.map');
            writeFileSync(sourcemapPath, JSON.stringify(sourcemap));
            const result = await parser.locate({
                sourcemapPath,
                line: -1,
                column: 0
            });
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });
        it('should return error for position with no mapping', async () => {
            const sourcemap = {
                version: 3,
                sources: ['src/index.ts'],
                names: [],
                mappings: '', // 空映射
                file: 'index.js'
            };
            const sourcemapPath = join(testDir, 'no-mapping.js.map');
            writeFileSync(sourcemapPath, JSON.stringify(sourcemap));
            const result = await parser.locate({
                sourcemapPath,
                line: 1,
                column: 0
            });
            expect(result.success).toBe(false);
            expect(result.error).toContain('No mapping found');
        });
    });
    describe('event handling', () => {
        it('should emit events during parsing', async () => {
            const events = [];
            parser.addEventListener(EventType.PARSE_START, () => events.push('parse_start'));
            parser.addEventListener(EventType.PARSE_COMPLETE, () => events.push('parse_complete'));
            parser.addEventListener(EventType.CACHE_MISS, () => events.push('cache_miss'));
            const sourcemap = {
                version: 3,
                sources: ['src/index.ts'],
                names: [],
                mappings: 'AAAA',
                file: 'index.js'
            };
            const sourcemapPath = join(testDir, 'events.js.map');
            writeFileSync(sourcemapPath, JSON.stringify(sourcemap));
            const consumer = await parser.parseSourcemap(sourcemapPath);
            expect(events).toContain('parse_start');
            expect(events).toContain('cache_miss');
            expect(events).toContain('parse_complete');
            consumer.destroy();
        });
    });
    describe('cache management', () => {
        it('should clear cache properly', async () => {
            const sourcemap = {
                version: 3,
                sources: ['src/index.ts'],
                names: [],
                mappings: 'AAAA',
                file: 'index.js'
            };
            const sourcemapPath = join(testDir, 'cache-clear.js.map');
            writeFileSync(sourcemapPath, JSON.stringify(sourcemap));
            // 解析并缓存
            const consumer1 = await parser.parseSourcemap(sourcemapPath);
            // 清理缓存
            parser.clearCache();
            // 再次解析应该创建新的consumer
            const consumer2 = await parser.parseSourcemap(sourcemapPath);
            expect(consumer1).not.toBe(consumer2);
            consumer2.destroy();
        });
    });
});
//# sourceMappingURL=parser.test.js.map