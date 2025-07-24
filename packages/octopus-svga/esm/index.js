import { OctopusPlatform, pluginSelector, pluginCanvas, pluginOfsCanvas, pluginDecode, pluginDownload, pluginFsm, pluginImage, pluginNow, pluginPath, pluginRAF, installPlugin } from 'octopus-platform';

class EnhancedPlatform extends OctopusPlatform {
    now;
    path;
    remote;
    local;
    decode;
    image;
    rAF;
    getSelector;
    getCanvas;
    getOfsCanvas;
    constructor() {
        super([
            pluginSelector,
            pluginCanvas,
            pluginOfsCanvas,
            pluginDecode,
            pluginDownload,
            pluginFsm,
            pluginImage,
            pluginNow,
            pluginPath,
            pluginRAF,
        ], "1.2.0");
        this.init();
    }
    installPlugin(plugin) {
        installPlugin(this, plugin);
    }
}
const platform = new EnhancedPlatform();

class ResourceManager {
    painter;
    /**
     * 判断是否是 ImageBitmap
     * @param img
     * @returns
     */
    static isBitmap(img) {
        return platform.globals.env === "h5" && img instanceof ImageBitmap;
    }
    /**
     * 释放内存资源（图片）
     * @param img
     */
    static releaseOne(img) {
        if (ResourceManager.isBitmap(img)) {
            img.close();
        }
        else if (img.src !== "") {
            // 【微信】将存在本地的文件删除，防止用户空间被占满
            if (platform.globals.env === "weapp" &&
                img.src.includes(platform.path.USER_DATA_PATH)) {
                platform.local.remove(img.src);
            }
            platform.image.release(img);
        }
    }
    // FIXME: 微信小程序创建调用太多createImage会导致微信/微信小程序崩溃
    caches = [];
    /**
     * 动态素材
     */
    dynamicMaterials = new Map();
    /**
     * 素材
     */
    materials = new Map();
    /**
     * 已清理Image对象的坐标
     */
    point = 0;
    constructor(painter) {
        this.painter = painter;
    }
    /**
     * 创建图片标签
     * @returns
     */
    createImage() {
        let img = null;
        if (this.point > 0) {
            this.point--;
            img = this.caches.shift();
        }
        if (!img) {
            img = platform.image.create(this.painter.F);
        }
        this.caches.push(img);
        return img;
    }
    /**
     * 将 ImageBitmap 插入到 caches
     * @param img
     */
    inertBitmapIntoCaches(img) {
        if (ResourceManager.isBitmap(img)) {
            this.caches.push(img);
        }
    }
    /**
     * 加载额外的图片资源
     * @param source 资源内容/地址
     * @param filename 文件名称
     * @returns
     */
    loadExtImage(source, filename) {
        return platform.image
            .load(() => this.createImage(), source, platform.path.resolve(filename, "ext"))
            .then((img) => {
            this.inertBitmapIntoCaches(img);
            return img;
        });
    }
    /**
     * 加载图片集
     * @param images 图片数据
     * @param filename 文件名称
     * @returns
     */
    async loadImagesWithRecord(images, filename, type = "normal") {
        const imageAwaits = [];
        const imageFilename = `${filename.replace(/\.svga$/g, "")}.png`;
        Object.entries(images).forEach(([name, image]) => {
            // 过滤 1px 透明图
            if (image instanceof Uint8Array && image.byteLength < 70) {
                return;
            }
            const p = platform.image
                .load(() => this.createImage(), image, platform.path.resolve(imageFilename, type === "dynamic" ? `dyn_${name}` : name))
                .then((img) => {
                this.inertBitmapIntoCaches(img);
                if (type === "dynamic") {
                    this.dynamicMaterials.set(name, img);
                }
                else {
                    this.materials.set(name, img);
                }
            });
            imageAwaits.push(p);
        });
        await Promise.all(imageAwaits);
    }
    /**
     * 释放图片资源
     */
    release() {
        // FIXME: 小程序 image 对象需要手动释放内存，否则可能导致小程序崩溃
        for (const img of this.caches) {
            ResourceManager.releaseOne(img);
        }
        this.materials.clear();
        this.dynamicMaterials.clear();
        // FIXME: 支付宝小程序 image 修改 src 无法触发 onload 事件
        platform.globals.env === "alipay" ? this.cleanup() : this.tidyUp();
    }
    /**
     * 整理图片资源，将重复的图片资源移除
     */
    tidyUp() {
        // 通过 Set 的去重特性，保持 caches 元素的唯一性
        this.caches = Array.from(new Set(this.caches));
        this.point = this.caches.length;
    }
    /**
     * 清理图片资源
     */
    cleanup() {
        this.caches.length = 0;
        this.point = 0;
    }
}

function readFloatLEImpl() {
    // 使用静态DataView池
    const DATA_VIEW_POOL_SIZE = 4;
    const dataViewPool = Array(DATA_VIEW_POOL_SIZE)
        .fill(0)
        .map(() => new DataView(new ArrayBuffer(8))); // 使用8字节支持double
    let currentViewIndex = 0;
    return function readFloatLE(buf, pos) {
        if (pos < 0 || pos + 4 > buf.length)
            throw new RangeError("Index out of range");
        // 轮换使用DataView池中的实例
        const view = dataViewPool[currentViewIndex];
        currentViewIndex = (currentViewIndex + 1) % DATA_VIEW_POOL_SIZE;
        // 直接设置字节，避免创建subarray
        const u8 = new Uint8Array(view.buffer);
        u8[0] = buf[pos];
        u8[1] = buf[pos + 1];
        u8[2] = buf[pos + 2];
        u8[3] = buf[pos + 3];
        return view.getFloat32(0, true);
    };
}
const readFloatLE = readFloatLEImpl();

/**
 * 简易的hash算法
 * @param buff
 * @param start
 * @param end
 * @param step
 * @returns
 */
function calculateHash(buff, start, end, step) {
    // 使用简单的哈希算法
    let hash = 0;
    for (let i = start; i < end; i += step) {
        // 简单的哈希算法，类似于字符串哈希
        hash = (hash << 5) - hash + buff[i];
        hash = hash & hash; // 转换为32位整数
    }
    // 添加数据长度作为哈希的一部分，增加唯一性
    hash = (hash << 5) - hash + end - start;
    hash = hash & hash;
    // 转换为字符串
    return hash.toString(36);
}

class Preflight {
    caches = new Map();
    count = 0;
    get size() {
        return this.caches.size;
    }
    get hitCount() {
        return this.count;
    }
    // get cache() {
    //   return Object.fromEntries(this.caches);
    // }
    /**
     * 计算二进制数据的哈希值
     * @param reader Reader对象
     * @param end 结束位置
     * @returns 哈希值
     */
    calculate(reader, end) {
        // 保存原始位置
        const { pos: startPos, buf } = reader;
        const endPos = Math.min(end, reader.len);
        // 采样数据以加快计算速度，同时保持足够的唯一性
        // 对于大数据，每隔几个字节采样一次
        const step = Math.max(1, Math.floor((endPos - startPos) / 100));
        return calculateHash(buf, startPos, endPos, step);
    }
    /**
     * 检查是否存在缓存数据
     * @param key 键
     * @returns 是否存在
     */
    has(key) {
        const hit = this.caches.has(key);
        if (hit) {
            this.count++;
        }
        return hit;
        // return this.caches.has(key);
    }
    /**
     * 获取缓存数据
     * @param key 键
     * @returns 缓存数据
     */
    get(key) {
        return this.caches.get(key);
    }
    /**
     * 设置缓存数据
     * @param key 键
     * @param value 缓存数据
     */
    set(key, value) {
        this.caches.set(key, value);
    }
    /**
     * 清空所有缓存数据
     */
    clear() {
        this.count = 0;
        this.caches.clear();
    }
}

class Reader {
    // 添加静态缓存，用于常用的空数组
    static EMPTY_UINT8ARRAY = new Uint8Array(0);
    /**
     * Read buffer.
     * @type {Uint8Array}
     */
    buf;
    /**
     * Read buffer length.
     * @type {number}
     */
    len;
    /**
     * Read buffer position.
     * @type {number}
     */
    pos;
    preflight = new Preflight();
    /**
     * Constructs a new reader instance using the specified buffer.
     * @classdesc Wire format reader using `Uint8Array` if available, otherwise `Array`.
     * @constructor
     * @param {Uint8Array} buffer Buffer to read from
     */
    constructor(buffer) {
        this.buf = buffer;
        this.pos = 0;
        this.len = buffer.length;
    }
    indexOutOfRange(reader, writeLength) {
        return new RangeError("index out of range: " +
            reader.pos +
            " + " +
            (writeLength || 1) +
            " > " +
            reader.len);
    }
    /**
     * 将复杂逻辑分离到单独方法
     * @returns
     */
    readVarint32Slow() {
        let byte = this.buf[this.pos++];
        let value = byte & 0x7f;
        let shift = 7;
        // 使用do-while循环减少条件判断
        do {
            if (this.pos >= this.len) {
                throw this.indexOutOfRange(this);
            }
            byte = this.buf[this.pos++];
            value |= (byte & 0x7f) << shift;
            shift += 7;
        } while (byte >= 128 && shift < 32);
        return value >>> 0; // 确保无符号
    }
    /**
     * Reads a sequence of bytes preceded by its length as a varint.
     * @param length
     * @returns
     */
    end(length) {
        return length === undefined ? this.len : this.pos + length;
    }
    /**
     * Reads a varint as an unsigned 32 bit value.
     * @function
     * @returns {number} Value read
     */
    uint32() {
        // 快速路径：大多数情况下是单字节
        const byte = this.buf[this.pos];
        if (byte < 128) {
            this.pos++;
            return byte;
        }
        // 慢速路径：多字节处理
        return this.readVarint32Slow();
    }
    /**
     * Reads a varint as a signed 32 bit value.
     * @returns {number} Value read
     */
    int32() {
        return this.uint32() | 0;
    }
    /**
     * Reads a float (32 bit) as a number.
     * @function
     * @returns {number} Value read
     */
    float() {
        const pos = this.pos + 4;
        if (pos > this.len) {
            throw this.indexOutOfRange(this, 4);
        }
        const value = readFloatLE(this.buf, this.pos);
        this.pos = pos;
        return value;
    }
    /**
     * read bytes range
     * @returns
     */
    getBytesRange() {
        const length = this.uint32();
        const start = this.pos;
        const end = start + length;
        if (end > this.len) {
            throw this.indexOutOfRange(this, length);
        }
        return [start, end, length];
    }
    /**
     * Reads a sequence of bytes preceded by its length as a varint.
     * @returns {Uint8Array} Value read
     */
    bytes() {
        const [start, end, length] = this.getBytesRange();
        this.pos += length;
        if (length === 0) {
            return Reader.EMPTY_UINT8ARRAY;
        }
        return this.buf.subarray(start, end);
    }
    /**
     * Reads a string preceeded by its byte length as a varint.
     * @returns {string} Value read
     */
    string() {
        const [start, end] = this.getBytesRange();
        // 直接在原始buffer上解码，避免创建中间bytes对象
        const result = platform.decode.utf8(this.buf, start, end);
        this.pos = end;
        return result;
    }
    /**
     * Skips the specified number of bytes if specified, otherwise skips a varint.
     * @param {number} [length] Length if known, otherwise a varint is assumed
     * @returns {Reader} `this`
     */
    skip(length) {
        if (typeof length === "number") {
            if (this.pos + length > this.len) {
                throw this.indexOutOfRange(this, length);
            }
            this.pos += length;
            return this;
        }
        // 变长整数跳过优化 - 使用位运算
        const { buf, len } = this;
        let pos = this.pos;
        // 一次检查多个字节，减少循环次数
        while (pos < len) {
            const byte = buf[pos++];
            if ((byte & 0x80) === 0) {
                this.pos = pos;
                return this;
            }
            // 快速检查连续的高位字节
            if (pos < len && (buf[pos] & 0x80) !== 0) {
                pos++;
                if (pos < len && (buf[pos] & 0x80) !== 0) {
                    pos++;
                    if (pos < len && (buf[pos] & 0x80) !== 0) {
                        pos++;
                        // 继续检查剩余字节
                        while (pos < len && (buf[pos] & 0x80) !== 0) {
                            pos++;
                            if (pos - this.pos >= 10) {
                                throw Error("invalid varint encoding");
                            }
                        }
                        if (pos < len) {
                            this.pos = pos + 1;
                            return this;
                        }
                    }
                }
            }
        }
        throw this.indexOutOfRange(this);
    }
    /**
     * Skips the next element of the specified wire type.
     * @param {number} wireType Wire type received
     * @returns {Reader} `this`
     */
    skipType(wireType) {
        switch (wireType) {
            case 0:
                this.skip();
                break;
            case 1:
                this.skip(8);
                break;
            case 2:
                this.skip(this.uint32());
                break;
            case 3:
                while ((wireType = this.uint32() & 7) !== 4) {
                    this.skipType(wireType);
                }
                break;
            case 5:
                this.skip(4);
                break;
            /* istanbul ignore next */
            default:
                throw Error("invalid wire type " + wireType + " at offset " + this.pos);
        }
        return this;
    }
}

class Layout {
    /**
     * Decodes a Layout message from the specified reader.
     * @function decode
     * @memberof com.opensource.svga.Layout
     * @static
     * @param {$protobuf.Reader} reader Reader to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.Layout} Layout
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader, length) {
        const { preflight } = reader;
        const end = reader.end(length);
        const hash = preflight.calculate(reader, end);
        if (preflight.has(hash)) {
            reader.pos = end;
            return preflight.get(hash);
        }
        const message = new Layout();
        let tag;
        while (reader.pos < end) {
            tag = reader.uint32();
            switch (tag >>> 3) {
                case 1: {
                    message.x = reader.float();
                    break;
                }
                case 2: {
                    message.y = reader.float();
                    break;
                }
                case 3: {
                    message.width = reader.float();
                    break;
                }
                case 4: {
                    message.height = reader.float();
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        preflight.set(hash, Layout.format(message));
        return preflight.get(hash);
    }
    static format(message) {
        const { x = 0, y = 0, width = 0, height = 0 } = message;
        return { x, y, width, height };
    }
    /**
     * Layout x.
     * @member {number} x
     * @memberof com.opensource.svga.Layout
     * @instance
     */
    x = 0;
    /**
     * Layout y.
     * @member {number} y
     * @memberof com.opensource.svga.Layout
     * @instance
     */
    y = 0;
    /**
     * Layout width.
     * @member {number} width
     * @memberof com.opensource.svga.Layout
     * @instance
     */
    width = 0;
    /**
     * Layout height.
     * @member {number} height
     * @memberof com.opensource.svga.Layout
     * @instance
     */
    height = 0;
}

class Transform {
    /**
     * Decodes a Transform message from the specified reader.
     * @function decode
     * @memberof com.opensource.svga.Transform
     * @static
     * @param {$protobuf.Reader} reader Reader to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.Transform} Transform
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader, length) {
        const end = reader.end(length);
        const message = new Transform();
        let tag;
        while (reader.pos < end) {
            tag = reader.uint32();
            switch (tag >>> 3) {
                case 1: {
                    message.a = reader.float();
                    break;
                }
                case 2: {
                    message.b = reader.float();
                    break;
                }
                case 3: {
                    message.c = reader.float();
                    break;
                }
                case 4: {
                    message.d = reader.float();
                    break;
                }
                case 5: {
                    message.tx = reader.float();
                    break;
                }
                case 6: {
                    message.ty = reader.float();
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    }
    /**
     * Transform a.
     * @member {number} a
     * @memberof com.opensource.svga.Transform
     * @instance
     */
    a = 0;
    /**
     * Transform b.
     * @member {number} b
     * @memberof com.opensource.svga.Transform
     * @instance
     */
    b = 0;
    /**
     * Transform c.
     * @member {number} c
     * @memberof com.opensource.svga.Transform
     * @instance
     */
    c = 0;
    /**
     * Transform d.
     * @member {number} d
     * @memberof com.opensource.svga.Transform
     * @instance
     */
    d = 0;
    /**
     * Transform tx.
     * @member {number} tx
     * @memberof com.opensource.svga.Transform
     * @instance
     */
    tx = 0;
    /**
     * Transform ty.
     * @member {number} ty
     * @memberof com.opensource.svga.Transform
     * @instance
     */
    ty = 0;
}

class ShapeArgs {
    /**
     * Decodes a ShapeArgs message from the specified reader.
     * @function decode
     * @memberof com.opensource.svga.ShapeEntity.ShapeArgs
     * @static
     * @param {$protobuf.Reader} reader Reader to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.ShapeEntity.ShapeArgs} ShapeArgs
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader, length) {
        const { preflight } = reader;
        const end = reader.end(length);
        const hash = preflight.calculate(reader, end);
        if (preflight.has(hash)) {
            reader.pos = end;
            return preflight.get(hash);
        }
        const message = new ShapeArgs();
        let tag;
        while (reader.pos < end) {
            tag = reader.uint32();
            switch (tag >>> 3) {
                case 1: {
                    message.d = reader.string();
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        preflight.set(hash, message);
        return preflight.get(hash);
    }
    /**
     * ShapeArgs d.
     * @member {string} d
     * @memberof com.opensource.svga.ShapeEntity.ShapeArgs
     * @instance
     */
    d = "";
}

class RectArgs {
    /**
     * Decodes a RectArgs message from the specified reader.
     * @function decode
     * @memberof com.opensource.svga.ShapeEntity.RectArgs
     * @static
     * @param {$protobuf.Reader} reader Reader to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.ShapeEntity.RectArgs} RectArgs
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader, length) {
        const { preflight } = reader;
        const end = reader.end(length);
        const hash = preflight.calculate(reader, end);
        if (preflight.has(hash)) {
            reader.pos = end;
            return preflight.get(hash);
        }
        const message = new RectArgs();
        let tag;
        while (reader.pos < end) {
            tag = reader.uint32();
            switch (tag >>> 3) {
                case 1: {
                    message.x = reader.float();
                    break;
                }
                case 2: {
                    message.y = reader.float();
                    break;
                }
                case 3: {
                    message.width = reader.float();
                    break;
                }
                case 4: {
                    message.height = reader.float();
                    break;
                }
                case 5: {
                    message.cornerRadius = reader.float();
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        preflight.set(hash, message);
        return preflight.get(hash);
    }
    /**
     * RectArgs x.
     * @member {number} x
     * @memberof com.opensource.svga.ShapeEntity.RectArgs
     * @instance
     */
    x = 0;
    /**
     * RectArgs y.
     * @member {number} y
     * @memberof com.opensource.svga.ShapeEntity.RectArgs
     * @instance
     */
    y = 0;
    /**
     * RectArgs width.
     * @member {number} width
     * @memberof com.opensource.svga.ShapeEntity.RectArgs
     * @instance
     */
    width = 0;
    /**
     * RectArgs height.
     * @member {number} height
     * @memberof com.opensource.svga.ShapeEntity.RectArgs
     * @instance
     */
    height = 0;
    /**
     * RectArgs cornerRadius.
     * @member {number} cornerRadius
     * @memberof com.opensource.svga.ShapeEntity.RectArgs
     * @instance
     */
    cornerRadius = 0;
}

class EllipseArgs {
    /**
     * Decodes an EllipseArgs message from the specified reader.
     * @function decode
     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
     * @static
     * @param {$protobuf.Reader} reader Reader to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.ShapeEntity.EllipseArgs} EllipseArgs
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader, length) {
        const { preflight } = reader;
        const end = reader.end(length);
        const hash = preflight.calculate(reader, end);
        if (preflight.has(hash)) {
            reader.pos = end;
            return preflight.get(hash);
        }
        const message = new EllipseArgs();
        let tag;
        while (reader.pos < end) {
            tag = reader.uint32();
            switch (tag >>> 3) {
                case 1: {
                    message.x = reader.float();
                    break;
                }
                case 2: {
                    message.y = reader.float();
                    break;
                }
                case 3: {
                    message.radiusX = reader.float();
                    break;
                }
                case 4: {
                    message.radiusY = reader.float();
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        preflight.set(hash, message);
        return preflight.get(hash);
    }
    /**
     * EllipseArgs x.
     * @member {number} x
     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
     * @instance
     */
    x = 0;
    /**
     * EllipseArgs y.
     * @member {number} y
     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
     * @instance
     */
    y = 0;
    /**
     * EllipseArgs radiusX.
     * @member {number} radiusX
     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
     * @instance
     */
    radiusX = 0;
    /**
     * EllipseArgs radiusY.
     * @member {number} radiusY
     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
     * @instance
     */
    radiusY = 0;
}

class RGBAColor {
    /**
     * Decodes a RGBAColor message from the specified reader.
     * @function decode
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
     * @static
     * @param {$protobuf.Reader} reader Reader to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor} RGBAColor
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader, length) {
        const { preflight } = reader;
        const end = reader.end(length);
        const hash = preflight.calculate(reader, end);
        if (preflight.has(hash)) {
            reader.pos = end;
            return preflight.get(hash);
        }
        const message = new RGBAColor();
        let tag;
        while (reader.pos < end) {
            tag = reader.uint32();
            switch (tag >>> 3) {
                case 1: {
                    message.r = reader.float();
                    break;
                }
                case 2: {
                    message.g = reader.float();
                    break;
                }
                case 3: {
                    message.b = reader.float();
                    break;
                }
                case 4: {
                    message.a = reader.float();
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        preflight.set(hash, RGBAColor.format(message));
        return preflight.get(hash);
    }
    static format(message) {
        const { r, g, b, a } = message;
        return `rgba(${(r * 255) | 0}, ${(g * 255) | 0}, ${(b * 255) | 0}, ${(a * 1) | 0})`;
    }
    /**
     * RGBAColor r.
     * @member {number} r
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
     * @instance
     */
    r = 0;
    /**
     * RGBAColor g.
     * @member {number} g
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
     * @instance
     */
    g = 0;
    /**
     * RGBAColor b.
     * @member {number} b
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
     * @instance
     */
    b = 0;
    /**
     * RGBAColor a.
     * @member {number} a
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
     * @instance
     */
    a = 0;
}

class ShapeStyle {
    /**
     * Decodes a ShapeStyle message from the specified reader.
     * @function decode
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @static
     * @param {$protobuf.Reader} reader Reader to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.ShapeEntity.ShapeStyle} ShapeStyle
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader, length) {
        const { preflight } = reader;
        const end = reader.end(length);
        const hash = preflight.calculate(reader, end);
        if (preflight.has(hash)) {
            reader.pos = end;
            return preflight.get(hash);
        }
        const message = new ShapeStyle();
        let tag;
        while (reader.pos < end) {
            tag = reader.uint32();
            switch (tag >>> 3) {
                case 1: {
                    message.fill = RGBAColor.decode(reader, reader.uint32());
                    break;
                }
                case 2: {
                    message.stroke = RGBAColor.decode(reader, reader.uint32());
                    break;
                }
                case 3: {
                    message.strokeWidth = reader.float();
                    break;
                }
                case 4: {
                    message.lineCap = reader.int32();
                    break;
                }
                case 5: {
                    message.lineJoin = reader.int32();
                    break;
                }
                case 6: {
                    message.miterLimit = reader.float();
                    break;
                }
                case 7: {
                    message.lineDashI = reader.float();
                    break;
                }
                case 8: {
                    message.lineDashII = reader.float();
                    break;
                }
                case 9: {
                    message.lineDashIII = reader.float();
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        preflight.set(hash, ShapeStyle.format(message));
        return preflight.get(hash);
    }
    static format(message) {
        const { fill, stroke, strokeWidth, miterLimit, lineDashI, lineDashII, lineDashIII } = message;
        const lineDash = [];
        let lineCap;
        let lineJoin;
        if (lineDashI > 0) {
            lineDash.push(lineDashI);
        }
        if (lineDashII > 0) {
            if (lineDash.length < 1) {
                lineDash.push(0);
            }
            lineDash.push(lineDashII);
        }
        if (lineDashIII > 0) {
            if (lineDash.length < 2) {
                lineDash.push(0, 0);
            }
            lineDash.push(lineDashIII);
        }
        switch (message.lineCap) {
            case 0 /* PlatformVideo.LINE_CAP_CODE.BUTT */:
                lineCap = "butt" /* PlatformVideo.LINE_CAP.BUTT */;
                break;
            case 1 /* PlatformVideo.LINE_CAP_CODE.ROUND */:
                lineCap = "round" /* PlatformVideo.LINE_CAP.ROUND */;
                break;
            case 2 /* PlatformVideo.LINE_CAP_CODE.SQUARE */:
                lineCap = "square" /* PlatformVideo.LINE_CAP.SQUARE */;
                break;
        }
        switch (message.lineJoin) {
            case 0 /* PlatformVideo.LINE_JOIN_CODE.MITER */:
                lineJoin = "miter" /* PlatformVideo.LINE_JOIN.MITER */;
                break;
            case 1 /* PlatformVideo.LINE_JOIN_CODE.ROUND */:
                lineJoin = "round" /* PlatformVideo.LINE_JOIN.ROUND */;
                break;
            case 2 /* PlatformVideo.LINE_JOIN_CODE.BEVEL */:
                lineJoin = "bevel" /* PlatformVideo.LINE_JOIN.BEVEL */;
                break;
        }
        return {
            lineDash,
            fill: fill ? fill : null,
            stroke: stroke ? stroke : null,
            lineCap,
            lineJoin,
            strokeWidth,
            miterLimit
        };
    }
    /**
     * ShapeStyle fill.
     * @member {com.opensource.svga.ShapeEntity.ShapeStyle.IRGBAColor|null|undefined} fill
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @instance
     */
    fill = null;
    /**
     * ShapeStyle stroke.
     * @member {com.opensource.svga.ShapeEntity.ShapeStyle.IRGBAColor|null|undefined} stroke
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @instance
     */
    stroke = null;
    /**
     * ShapeStyle strokeWidth.
     * @member {number} strokeWidth
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @instance
     */
    strokeWidth = 0;
    /**
     * ShapeStyle lineCap.
     * @member {com.opensource.svga.ShapeEntity.ShapeStyle.LineCap} lineCap
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @instance
     */
    lineCap = 0;
    /**
     * ShapeStyle lineJoin.
     * @member {com.opensource.svga.ShapeEntity.ShapeStyle.LineJoin} lineJoin
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @instance
     */
    lineJoin = 0;
    /**
     * ShapeStyle miterLimit.
     * @member {number} miterLimit
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @instance
     */
    miterLimit = 0;
    /**
     * ShapeStyle lineDashI.
     * @member {number} lineDashI
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @instance
     */
    lineDashI = 0;
    /**
     * ShapeStyle lineDashII.
     * @member {number} lineDashII
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @instance
     */
    lineDashII = 0;
    /**
     * ShapeStyle lineDashIII.
     * @member {number} lineDashIII
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @instance
     */
    lineDashIII = 0;
}

class ShapeEntity {
    /**
     * Decodes a ShapeEntity message from the specified reader.
     * @function decode
     * @memberof com.opensource.svga.ShapeEntity
     * @static
     * @param {$protobuf.Reader} reader Reader to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.ShapeEntity} ShapeEntity
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader, length) {
        const end = reader.end(length);
        const message = new ShapeEntity();
        let tag;
        while (reader.pos < end) {
            tag = reader.uint32();
            switch (tag >>> 3) {
                case 1: {
                    message.type = reader.int32();
                    break;
                }
                case 2: {
                    message.shape = ShapeArgs.decode(reader, reader.uint32());
                    break;
                }
                case 3: {
                    message.rect = RectArgs.decode(reader, reader.uint32());
                    break;
                }
                case 4: {
                    message.ellipse = EllipseArgs.decode(reader, reader.uint32());
                    break;
                }
                case 10: {
                    message.styles = ShapeStyle.decode(reader, reader.uint32());
                    break;
                }
                case 11: {
                    message.transform = Transform.decode(reader, reader.uint32());
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return ShapeEntity.format(message);
    }
    static format(message) {
        const { type, shape, rect, ellipse, styles, transform } = message;
        switch (type) {
            case 0 /* PlatformVideo.SHAPE_TYPE_CODE.SHAPE */:
                return {
                    type: "shape" /* PlatformVideo.SHAPE_TYPE.SHAPE */,
                    path: shape,
                    styles: styles,
                    transform: transform,
                };
            case 1 /* PlatformVideo.SHAPE_TYPE_CODE.RECT */:
                return {
                    type: "rect" /* PlatformVideo.SHAPE_TYPE.RECT */,
                    path: rect,
                    styles: styles,
                    transform: transform,
                };
            case 2 /* PlatformVideo.SHAPE_TYPE_CODE.ELLIPSE */:
                return {
                    type: "ellipse" /* PlatformVideo.SHAPE_TYPE.ELLIPSE */,
                    path: ellipse,
                    styles: styles,
                    transform: transform,
                };
        }
        return null;
    }
    /**
     * ShapeEntity type.
     * @member {com.opensource.svga.ShapeEntity.ShapeType} type
     * @memberof com.opensource.svga.ShapeEntity
     * @instance
     */
    type = 0;
    /**
     * ShapeEntity shape.
     * @member {com.opensource.svga.ShapeEntity.IShapeArgs|null|undefined} shape
     * @memberof com.opensource.svga.ShapeEntity
     * @instance
     */
    shape = null;
    /**
     * ShapeEntity rect.
     * @member {com.opensource.svga.ShapeEntity.IRectArgs|null|undefined} rect
     * @memberof com.opensource.svga.ShapeEntity
     * @instance
     */
    rect = null;
    /**
     * ShapeEntity ellipse.
     * @member {com.opensource.svga.ShapeEntity.IEllipseArgs|null|undefined} ellipse
     * @memberof com.opensource.svga.ShapeEntity
     * @instance
     */
    ellipse = null;
    /**
     * ShapeEntity styles.
     * @member {com.opensource.svga.ShapeEntity.IShapeStyle|null|undefined} styles
     * @memberof com.opensource.svga.ShapeEntity
     * @instance
     */
    styles = null;
    /**
     * ShapeEntity transform.
     * @member {com.opensource.svga.ITransform|null|undefined} transform
     * @memberof com.opensource.svga.ShapeEntity
     * @instance
     */
    transform = null;
}

class FrameEntity {
    static HIDDEN_FRAME = {
        alpha: 0,
    };
    /**
     * Decodes a FrameEntity message from the specified reader.
     * @function decode
     * @memberof com.opensource.svga.FrameEntity
     * @static
     * @param {$protobuf.Reader} reader Reader to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.FrameEntity} FrameEntity
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader, length) {
        const end = reader.end(length);
        const message = new FrameEntity();
        let tag;
        while (reader.pos < end) {
            tag = reader.uint32();
            switch (tag >>> 3) {
                case 1: {
                    message.alpha = reader.float();
                    break;
                }
                case 2: {
                    message.layout = Layout.decode(reader, reader.uint32());
                    break;
                }
                case 3: {
                    message.transform = Transform.decode(reader, reader.uint32());
                    break;
                }
                case 4: {
                    message.clipPath = reader.string();
                    break;
                }
                case 5: {
                    const shape = ShapeEntity.decode(reader, reader.uint32());
                    if (shape !== null) {
                        message.shapes.push(shape);
                    }
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        if (message.shapes.length === 0) {
            message.shapes = reader.preflight.get("latest_shapes");
        }
        else {
            reader.preflight.set("latest_shapes", message.shapes);
        }
        return FrameEntity.format(message);
    }
    static format(message) {
        // alpha值小于 0.05 将不展示，所以不做解析处理
        if (message.alpha < 0.05) {
            return FrameEntity.HIDDEN_FRAME;
        }
        const { alpha, layout, transform, shapes } = message;
        return {
            alpha,
            layout: layout,
            transform,
            shapes,
        };
    }
    /**
     * FrameEntity shapes.
     * @member {Array.<com.opensource.svga.IShapeEntity>} shapes
     * @memberof com.opensource.svga.FrameEntity
     * @instance
     */
    shapes = [];
    /**
     * FrameEntity alpha.
     * @member {number} alpha
     * @memberof com.opensource.svga.FrameEntity
     * @instance
     */
    alpha = 0;
    /**
     * FrameEntity layout.
     * @member {com.opensource.svga.ILayout|null|undefined} layout
     * @memberof com.opensource.svga.FrameEntity
     * @instance
     */
    layout = null;
    /**
     * FrameEntity transform.
     * @member {com.opensource.svga.ITransform|null|undefined} transform
     * @memberof com.opensource.svga.FrameEntity
     * @instance
     */
    transform = null;
    /**
     * FrameEntity clipPath.
     * @member {string} clipPath
     * @memberof com.opensource.svga.FrameEntity
     * @instance
     */
    clipPath = "";
}

class SpriteEntity {
    /**
     * Decodes a SpriteEntity message from the specified reader.
     * @function decode
     * @memberof com.opensource.svga.SpriteEntity
     * @static
     * @param {$protobuf.Reader} reader Reader to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.SpriteEntity} SpriteEntity
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader, length) {
        const end = reader.end(length);
        const message = new SpriteEntity();
        let tag;
        reader.preflight.set("latest_shapes", []);
        while (reader.pos < end) {
            tag = reader.uint32();
            switch (tag >>> 3) {
                case 1: {
                    message.imageKey = reader.string();
                    break;
                }
                case 2: {
                    if (!(message.frames && message.frames.length)) {
                        message.frames = [];
                    }
                    message.frames.push(FrameEntity.decode(reader, reader.uint32()));
                    break;
                }
                case 3: {
                    message.matteKey = reader.string();
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return SpriteEntity.format(message);
    }
    static format(message) {
        return {
            imageKey: message.imageKey,
            frames: message.frames,
        };
    }
    /**
     * SpriteEntity frames.
     * @member {Array.<com.opensource.svga.IFrameEntity>} frames
     * @memberof com.opensource.svga.SpriteEntity
     * @instance
     */
    frames = [];
    /**
     * SpriteEntity imageKey.
     * @member {string} imageKey
     * @memberof com.opensource.svga.SpriteEntity
     * @instance
     */
    imageKey = "";
    /**
     * SpriteEntity matteKey.
     * @member {string} matteKey
     * @memberof com.opensource.svga.SpriteEntity
     * @instance
     */
    matteKey = "";
}

class MovieParams {
    /**
     * Decodes a MovieParams message from the specified reader.
     * @function decode
     * @memberof com.opensource.svga.MovieParams
     * @static
     * @param {$protobuf.Reader} reader Reader to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.MovieParams} MovieParams
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader, length) {
        const end = reader.end(length);
        const message = new MovieParams();
        let tag;
        while (reader.pos < end) {
            tag = reader.uint32();
            switch (tag >>> 3) {
                case 1: {
                    message.viewBoxWidth = reader.float();
                    break;
                }
                case 2: {
                    message.viewBoxHeight = reader.float();
                    break;
                }
                case 3: {
                    message.fps = reader.int32();
                    break;
                }
                case 4: {
                    message.frames = reader.int32();
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    }
    /**
     * MovieParams viewBoxWidth.
     * @member {number} viewBoxWidth
     * @memberof com.opensource.svga.MovieParams
     * @instance
     */
    viewBoxWidth = 0;
    /**
     * MovieParams viewBoxHeight.
     * @member {number} viewBoxHeight
     * @memberof com.opensource.svga.MovieParams
     * @instance
     */
    viewBoxHeight = 0;
    /**
     * MovieParams fps.
     * @member {number} fps
     * @memberof com.opensource.svga.MovieParams
     * @instance
     */
    fps = 0;
    /**
     * MovieParams frames.
     * @member {number} frames
     * @memberof com.opensource.svga.MovieParams
     * @instance
     */
    frames = 0;
}

class MovieEntity {
    static EMPTY_U8 = new Uint8Array(0);
    /**
     * Decodes a MovieEntity message from the specified reader.
     * @function decode
     * @memberof com.opensource.svga.MovieEntity
     * @static
     * @param {$protobuf.Reader} reader Reader to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.MovieEntity} MovieEntity
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader, length) {
        const end = reader.end(length);
        const message = new MovieEntity();
        let key;
        let value;
        let end2;
        let tag;
        let tag2;
        while (reader.pos < end) {
            tag = reader.uint32();
            switch (tag >>> 3) {
                case 1: {
                    message.version = reader.string();
                    break;
                }
                case 2: {
                    message.params = MovieParams.decode(reader, reader.uint32());
                    break;
                }
                case 3: {
                    end2 = reader.uint32() + reader.pos;
                    key = "";
                    value = MovieEntity.EMPTY_U8;
                    while (reader.pos < end2) {
                        tag2 = reader.uint32();
                        switch (tag2 >>> 3) {
                            case 1:
                                key = reader.string();
                                break;
                            case 2:
                                value = reader.bytes();
                                break;
                            default:
                                reader.skipType(tag2 & 7);
                                break;
                        }
                    }
                    message.images[key] = value;
                    break;
                }
                case 4: {
                    message.sprites.push(SpriteEntity.decode(reader, reader.uint32()));
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return MovieEntity.format(message);
    }
    static format(message) {
        const { version, images, sprites } = message;
        const { fps, frames, viewBoxWidth, viewBoxHeight } = message.params;
        return {
            version,
            filename: "",
            locked: false,
            dynamicElements: {},
            size: {
                width: viewBoxWidth,
                height: viewBoxHeight,
            },
            fps,
            frames,
            images,
            sprites,
        };
    }
    /**
     * MovieEntity version.
     * @member {string} version
     * @memberof com.opensource.svga.MovieEntity
     * @instance
     */
    version = "";
    /**
     * MovieEntity params.
     * @member {com.opensource.svga.IMovieParams|null|undefined} params
     * @memberof com.opensource.svga.MovieEntity
     * @instance
     */
    params = null;
    /**
     * MovieEntity images.
     * @member {Object.<string,Uint8Array>} images
     * @memberof com.opensource.svga.MovieEntity
     * @instance
     */
    images = {};
    /**
     * MovieEntity sprites.
     * @member {Array.<com.opensource.svga.ISpriteEntity>} sprites
     * @memberof com.opensource.svga.MovieEntity
     * @instance
     */
    sprites = [];
}

// import benchmark from "octopus-benchmark";
function createVideoEntity(data, filename) {
    if (data instanceof Uint8Array) {
        const reader = new Reader(data);
        const video = MovieEntity.decode(reader);
        // benchmark.log('preflight cache size', reader.preflight.size);
        // benchmark.log('preflight hit count', reader.preflight.hitCount);
        video.filename = filename;
        reader.preflight.clear();
        return video;
    }
    throw new Error("Invalid data type");
}

/**
 * CurrentPoint对象池，用于减少对象创建和GC压力
 */
class PointPool {
    pool = [];
    acquire() {
        const { pool } = this;
        return pool.length > 0
            ? pool.pop()
            : { x: 0, y: 0, x1: 0, y1: 0, x2: 0, y2: 0 };
    }
    release(point) {
        // 重置点的属性
        point.x = point.y = point.x1 = point.y1 = point.x2 = point.y2 = 0;
        this.pool.push(point);
    }
}

class Renderer2D {
    context;
    /**
     * https://developer.mozilla.org/zh-CN/docs/Web/SVG/Tutorial/Paths
     * 绘制路径的不同指令：
     * * 直线命令
     * - M: moveTo，移动到指定点，不绘制直线。
     * - L: lineTo，从起始点绘制一条直线到指定点。
     * - H: horizontal lineTo，从起始点绘制一条水平线到指定点。
     * - V: vertical lineTo，从起始点绘制一条垂直线到指定点。
     * - Z: closePath，从起始点绘制一条直线到路径起点，形成一个闭合路径。
     * * 曲线命令
     * - C: bezierCurveTo，绘制三次贝塞尔曲线。
     * - S: smooth curveTo，绘制平滑三次贝塞尔曲线。
     * - Q: quadraticCurveTo，绘制两次贝塞尔曲线。
     * - T: smooth quadraticCurveTo，绘制平滑两次贝塞尔曲线。
     * * 弧线命令
     * - A: arcTo，从起始点绘制一条弧线到指定点。
     */
    static SVG_PATH = new Set([
        "M",
        "L",
        "H",
        "V",
        "Z",
        "C",
        "S",
        "Q",
        "m",
        "l",
        "h",
        "v",
        "z",
        "c",
        "s",
        "q",
    ]);
    static SVG_LETTER_REGEXP = /[a-zA-Z]/;
    // 在Renderer2D类中添加新的解析方法
    static parseSVGPath(d) {
        const { SVG_LETTER_REGEXP } = Renderer2D;
        const result = [];
        let currentIndex = 0;
        // 状态：0 - 等待命令，1 - 读取参数
        let state = 0;
        let currentCommand = "";
        let currentArgs = "";
        while (currentIndex < d.length) {
            const char = d[currentIndex];
            switch (state) {
                case 0: // 等待命令
                    if (SVG_LETTER_REGEXP.test(char)) {
                        currentCommand = char;
                        state = 1;
                    }
                    break;
                case 1: // 读取参数
                    if (SVG_LETTER_REGEXP.test(char)) {
                        // 遇到新命令，保存当前命令和参数
                        result.push({
                            command: currentCommand,
                            args: currentArgs.trim(),
                        });
                        currentCommand = char;
                        currentArgs = "";
                    }
                    else {
                        currentArgs += char;
                    }
                    break;
            }
            currentIndex++;
        }
        // 处理最后一个命令
        if (currentCommand && state === 1) {
            result.push({
                command: currentCommand,
                args: currentArgs.trim(),
            });
        }
        return result;
    }
    static fillOrStroke(context, styles) {
        if (styles) {
            if (styles.fill) {
                context.fill();
            }
            if (styles.stroke) {
                context.stroke();
            }
        }
    }
    static resetShapeStyles(context, styles) {
        if (styles) {
            context.strokeStyle = styles.stroke || "transparent";
            if (styles.strokeWidth > 0) {
                context.lineWidth = styles.strokeWidth;
            }
            if (styles.miterLimit > 0) {
                context.miterLimit = styles.miterLimit;
            }
            if (styles.lineCap) {
                context.lineCap = styles.lineCap;
            }
            if (styles.lineJoin) {
                context.lineJoin = styles.lineJoin;
            }
            context.fillStyle = styles.fill || "transparent";
            if (styles.lineDash) {
                context.setLineDash(styles.lineDash);
            }
        }
    }
    /**
     * 计算缩放比例
     * @param contentMode
     * @param videoSize
     * @param canvasSize
     * @returns
     */
    static calculateScale(contentMode, videoSize, canvasSize) {
        const imageRatio = videoSize.width / videoSize.height;
        const viewRatio = canvasSize.width / canvasSize.height;
        const isAspectFit = contentMode === "aspect-fit" /* PLAYER_CONTENT_MODE.ASPECT_FIT */;
        const shouldUseWidth = (imageRatio >= viewRatio && isAspectFit) ||
            (imageRatio <= viewRatio && !isAspectFit);
        const createTransform = (scale, translateX, translateY) => ({
            scaleX: scale,
            scaleY: scale,
            translateX,
            translateY,
        });
        if (shouldUseWidth) {
            const scale = canvasSize.width / videoSize.width;
            return createTransform(scale, 0, (canvasSize.height - videoSize.height * scale) / 2);
        }
        const scale = canvasSize.height / videoSize.height;
        return createTransform(scale, (canvasSize.width - videoSize.width * scale) / 2, 0);
    }
    pointPool = new PointPool();
    currentPoint;
    lastResizeKey = "";
    globalTransform = undefined;
    constructor(context) {
        this.context = context;
        this.currentPoint = this.pointPool.acquire();
    }
    setTransform(transform) {
        if (transform && this.context) {
            this.context.transform(transform.a, transform.b, transform.c, transform.d, transform.tx, transform.ty);
        }
    }
    drawBezier(d, transform, styles) {
        const { context, pointPool } = this;
        this.currentPoint = pointPool.acquire();
        context.save();
        Renderer2D.resetShapeStyles(context, styles);
        this.setTransform(transform);
        context.beginPath();
        if (d) {
            // 使用状态机解析器替代正则表达式
            const commands = Renderer2D.parseSVGPath(d);
            for (const { command, args } of commands) {
                if (Renderer2D.SVG_PATH.has(command)) {
                    this.drawBezierElement(this.currentPoint, command, args.split(/[\s,]+/).filter(Boolean));
                }
            }
        }
        Renderer2D.fillOrStroke(context, styles);
        pointPool.release(this.currentPoint);
        context.restore();
    }
    drawBezierElement(currentPoint, method, args) {
        const { context } = this;
        switch (method) {
            case "M":
                currentPoint.x = +args[0];
                currentPoint.y = +args[1];
                context.moveTo(currentPoint.x, currentPoint.y);
                break;
            case "m":
                currentPoint.x += +args[0];
                currentPoint.y += +args[1];
                context.moveTo(currentPoint.x, currentPoint.y);
                break;
            case "L":
                currentPoint.x = +args[0];
                currentPoint.y = +args[1];
                context.lineTo(currentPoint.x, currentPoint.y);
                break;
            case "l":
                currentPoint.x += +args[0];
                currentPoint.y += +args[1];
                context.lineTo(currentPoint.x, currentPoint.y);
                break;
            case "H":
                currentPoint.x = +args[0];
                context.lineTo(currentPoint.x, currentPoint.y);
                break;
            case "h":
                currentPoint.x += +args[0];
                context.lineTo(currentPoint.x, currentPoint.y);
                break;
            case "V":
                currentPoint.y = +args[0];
                context.lineTo(currentPoint.x, currentPoint.y);
                break;
            case "v":
                currentPoint.y += +args[0];
                context.lineTo(currentPoint.x, currentPoint.y);
                break;
            case "C":
                currentPoint.x1 = +args[0];
                currentPoint.y1 = +args[1];
                currentPoint.x2 = +args[2];
                currentPoint.y2 = +args[3];
                currentPoint.x = +args[4];
                currentPoint.y = +args[5];
                context.bezierCurveTo(currentPoint.x1, currentPoint.y1, currentPoint.x2, currentPoint.y2, currentPoint.x, currentPoint.y);
                break;
            case "c":
                currentPoint.x1 = currentPoint.x + +args[0];
                currentPoint.y1 = currentPoint.y + +args[1];
                currentPoint.x2 = currentPoint.x + +args[2];
                currentPoint.y2 = currentPoint.y + +args[3];
                currentPoint.x += +args[4];
                currentPoint.y += +args[5];
                context.bezierCurveTo(currentPoint.x1, currentPoint.y1, currentPoint.x2, currentPoint.y2, currentPoint.x, currentPoint.y);
                break;
            case "S":
                if (currentPoint.x1 !== undefined &&
                    currentPoint.y1 !== undefined &&
                    currentPoint.x2 !== undefined &&
                    currentPoint.y2 !== undefined) {
                    currentPoint.x1 = currentPoint.x - currentPoint.x2 + currentPoint.x;
                    currentPoint.y1 = currentPoint.y - currentPoint.y2 + currentPoint.y;
                    currentPoint.x2 = +args[0];
                    currentPoint.y2 = +args[1];
                    currentPoint.x = +args[2];
                    currentPoint.y = +args[3];
                    context.bezierCurveTo(currentPoint.x1, currentPoint.y1, currentPoint.x2, currentPoint.y2, currentPoint.x, currentPoint.y);
                }
                else {
                    currentPoint.x1 = +args[0];
                    currentPoint.y1 = +args[1];
                    currentPoint.x = +args[2];
                    currentPoint.y = +args[3];
                    context.quadraticCurveTo(currentPoint.x1, currentPoint.y1, currentPoint.x, currentPoint.y);
                }
                break;
            case "s":
                if (currentPoint.x1 !== undefined &&
                    currentPoint.y1 !== undefined &&
                    currentPoint.x2 !== undefined &&
                    currentPoint.y2 !== undefined) {
                    currentPoint.x1 = currentPoint.x - currentPoint.x2 + currentPoint.x;
                    currentPoint.y1 = currentPoint.y - currentPoint.y2 + currentPoint.y;
                    currentPoint.x2 = currentPoint.x + +args[0];
                    currentPoint.y2 = currentPoint.y + +args[1];
                    currentPoint.x += +args[2];
                    currentPoint.y += +args[3];
                    context.bezierCurveTo(currentPoint.x1, currentPoint.y1, currentPoint.x2, currentPoint.y2, currentPoint.x, currentPoint.y);
                }
                else {
                    currentPoint.x1 = currentPoint.x + +args[0];
                    currentPoint.y1 = currentPoint.y + +args[1];
                    currentPoint.x += +args[2];
                    currentPoint.y += +args[3];
                    context.quadraticCurveTo(currentPoint.x1, currentPoint.y1, currentPoint.x, currentPoint.y);
                }
                break;
            case "Q":
                currentPoint.x1 = +args[0];
                currentPoint.y1 = +args[1];
                currentPoint.x = +args[2];
                currentPoint.y = +args[3];
                context.quadraticCurveTo(currentPoint.x1, currentPoint.y1, currentPoint.x, currentPoint.y);
                break;
            case "q":
                currentPoint.x1 = currentPoint.x + +args[0];
                currentPoint.y1 = currentPoint.y + +args[1];
                currentPoint.x += +args[2];
                currentPoint.y += +args[3];
                context.quadraticCurveTo(currentPoint.x1, currentPoint.y1, currentPoint.x, currentPoint.y);
                break;
            case "Z":
            case "z":
                context.closePath();
                break;
        }
    }
    drawEllipse(x, y, radiusX, radiusY, transform, styles) {
        const { context } = this;
        context.save();
        Renderer2D.resetShapeStyles(context, styles);
        this.setTransform(transform);
        x -= radiusX;
        y -= radiusY;
        const w = radiusX * 2;
        const h = radiusY * 2;
        const kappa = 0.5522848;
        const ox = (w / 2) * kappa;
        const oy = (h / 2) * kappa;
        const xe = x + w;
        const ye = y + h;
        const xm = x + w / 2;
        const ym = y + h / 2;
        context.beginPath();
        context.moveTo(x, ym);
        context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
        context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
        context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
        context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
        Renderer2D.fillOrStroke(context, styles);
        context.restore();
    }
    drawRect(x, y, width, height, cornerRadius, transform, styles) {
        const { context } = this;
        context.save();
        Renderer2D.resetShapeStyles(context, styles);
        this.setTransform(transform);
        let radius = cornerRadius;
        if (width < 2 * radius) {
            radius = width / 2;
        }
        if (height < 2 * radius) {
            radius = height / 2;
        }
        context.beginPath();
        context.moveTo(x + radius, y);
        context.arcTo(x + width, y, x + width, y + height, radius);
        context.arcTo(x + width, y + height, x, y + height, radius);
        context.arcTo(x, y + height, x, y, radius);
        context.arcTo(x, y, x + width, y, radius);
        context.closePath();
        Renderer2D.fillOrStroke(context, styles);
        context.restore();
    }
    drawShape(shape) {
        const { type, path, transform, styles } = shape;
        switch (type) {
            case "shape" /* PlatformVideo.SHAPE_TYPE.SHAPE */:
                this.drawBezier(path.d, transform, styles);
                break;
            case "ellipse" /* PlatformVideo.SHAPE_TYPE.ELLIPSE */:
                this.drawEllipse(path.x ?? 0, path.y ?? 0, path.radiusX ?? 0, path.radiusY ?? 0, transform, styles);
                break;
            case "rect" /* PlatformVideo.SHAPE_TYPE.RECT */:
                this.drawRect(path.x ?? 0, path.y ?? 0, path.width ?? 0, path.height ?? 0, path.cornerRadius ?? 0, transform, styles);
                break;
        }
    }
    drawSprite(frame, bitmap, dynamicElement) {
        if (frame.alpha === 0)
            return;
        const { context } = this;
        const { alpha, transform, layout, shapes } = frame;
        const { a = 1, b = 0, c = 0, d = 1, tx = 0, ty = 0 } = transform ?? {};
        context.save();
        this.setTransform(this.globalTransform);
        context.globalAlpha = alpha;
        context.transform(a, b, c, d, tx, ty);
        if (bitmap) {
            context.drawImage(bitmap, 0, 0, layout.width, layout.height);
        }
        if (dynamicElement) {
            context.drawImage(dynamicElement, (layout.width - dynamicElement.width) / 2, (layout.height - dynamicElement.height) / 2);
        }
        for (let i = 0; i < shapes.length; i++) {
            this.drawShape(shapes[i]);
        }
        context.restore();
    }
    /**
     * 调整画布尺寸
     * @param contentMode
     * @param videoSize
     * @param canvasSize
     * @returns
     */
    resize(contentMode, videoSize, canvasSize) {
        const { width: canvasWidth, height: canvasHeight } = canvasSize;
        const { width: videoWidth, height: videoHeight } = videoSize;
        const resizeKey = `${contentMode}-${videoWidth}-${videoHeight}-${canvasWidth}-${canvasHeight}`;
        const lastTransform = this.globalTransform;
        if (this.lastResizeKey === resizeKey && lastTransform) {
            return;
        }
        let scale = {
            scaleX: 1,
            scaleY: 1,
            translateX: 0,
            translateY: 0,
        };
        if (contentMode === "fill" /* PLAYER_CONTENT_MODE.FILL */) {
            scale.scaleX = canvasWidth / videoWidth;
            scale.scaleY = canvasHeight / videoHeight;
        }
        else {
            scale = Renderer2D.calculateScale(contentMode, videoSize, canvasSize);
        }
        this.lastResizeKey = resizeKey;
        this.globalTransform = {
            a: scale.scaleX,
            b: 0.0,
            c: 0.0,
            d: scale.scaleY,
            tx: scale.translateX,
            ty: scale.translateY,
        };
    }
    render(videoEntity, materials, dynamicMaterials, currentFrame, head, tail) {
        let sprite;
        let imageKey;
        let bitmap;
        let dynamicElement;
        for (let i = head; i < tail; i++) {
            sprite = videoEntity.sprites[i];
            imageKey = sprite.imageKey;
            bitmap = materials.get(imageKey);
            dynamicElement = dynamicMaterials.get(imageKey);
            this.drawSprite(sprite.frames[currentFrame], bitmap, dynamicElement);
        }
    }
    destroy() {
        this.globalTransform = undefined;
        this.lastResizeKey = "";
        this.context = null;
    }
}

/**
 * 动画控制器
 */
class Animator {
    /**
     * 动画是否执行
     */
    isRunning = false;
    /**
     * 动画开始时间
     */
    startTime = 0;
    /**
     * 动画持续时间
     */
    duration = 0;
    /**
     * 循环播放开始帧与动画开始帧之间的时间偏差
     */
    loopStart = 0;
    /**
     * 动画暂停时的时间偏差
     */
    pauseTime = 0;
    /**
     * 循环持续时间
     */
    loopDuration = 0;
    onAnimate = (platform.noop);
    /* ---- 事件钩子 ---- */
    onStart = platform.noop;
    onUpdate = platform.noop;
    onEnd = platform.noop;
    /**
     * 设置动画的必要参数
     * @param duration
     * @param loopStart
     * @param loop
     * @param fillValue
     */
    setConfig(duration, loopStart, loop, fillValue) {
        this.duration = duration;
        this.loopStart = loopStart;
        this.loopDuration = duration * loop + fillValue - loopStart;
    }
    start() {
        this.isRunning = true;
        this.startTime = platform.now();
        this.pauseTime = 0;
        this.onStart();
        this.doFrame();
    }
    resume() {
        if (this.startTime === 0) {
            return false;
        }
        this.isRunning = true;
        this.doFrame();
        return true;
    }
    pause() {
        if (this.startTime === 0) {
            return false;
        }
        this.isRunning = false;
        // 设置暂停的位置
        this.pauseTime =
            (platform.now() - this.startTime) % this.duration;
        return true;
    }
    stop() {
        this.isRunning = false;
        this.startTime = 0;
    }
    doFrame() {
        if (this.isRunning) {
            this.doDeltaTime(platform.now() - this.startTime);
            if (this.isRunning) {
                this.onAnimate(() => this.doFrame());
            }
        }
    }
    doDeltaTime(deltaTime) {
        const { duration, loopStart, pauseTime, loopDuration } = this;
        // 本轮动画已消耗的时间比例（Percentage of speed time）
        let percent;
        let ended = false;
        // 运行时间 大于等于 循环持续时间
        if (deltaTime >= loopDuration) {
            // 动画已结束
            percent = 1.0;
            ended = true;
            this.stop();
        }
        else {
            // 本轮动画已消耗的时间比例 = 本轮动画已消耗的时间 / 动画持续时间
            percent = ((deltaTime + loopStart + pauseTime) % duration) / duration;
        }
        this.onUpdate(percent);
        if (!this.isRunning && ended) {
            this.onEnd();
        }
    }
}

// DEFLATE is a complex format; to read this code, you should probably check the RFC first:
// https://tools.ietf.org/html/rfc1951
// You may also wish to take a look at the guide I made about this program:
// https://gist.github.com/101arrowz/253f31eb5abc3d9275ab943003ffecad
// Some of the following code is similar to that of UZIP.js:
// https://github.com/photopea/UZIP.js
// However, the vast majority of the codebase has diverged from UZIP.js to increase performance and reduce bundle size.
// Sometimes 0 will appear where -1 would be more appropriate. This is because using a uint
// is better for memory in most engines (I *think*).
// aliases for shorter compressed code (most minifers don't do this)
const u8 = Uint8Array, u16 = Uint16Array, i32 = Int32Array;
// fixed length extra bits
const fleb = new u8([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, /* unused */ 0, 0, /* impossible */ 0]);
// fixed distance extra bits
const fdeb = new u8([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, /* unused */ 0, 0]);
// code length index map
const clim = new u8([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
// get base, reverse index map from extra bits
const freb = (eb, start) => {
    const b = new u16(31);
    for (let i = 0; i < 31; ++i) {
        b[i] = start += 1 << eb[i - 1];
    }
    // numbers here are at max 18 bits
    const r = new i32(b[30]);
    for (let i = 1; i < 30; ++i) {
        for (let j = b[i]; j < b[i + 1]; ++j) {
            r[j] = ((j - b[i]) << 5) | i;
        }
    }
    return { b, r };
};
const { b: fl, r: revfl } = freb(fleb, 2);
// we can ignore the fact that the other numbers are wrong; they never happen anyway
fl[28] = 258, revfl[258] = 28;
const { b: fd, r: revfd } = freb(fdeb, 0);
// map of value to reverse (assuming 16 bits)
const rev = new u16(32768);
for (let i = 0; i < 32768; ++i) {
    // reverse table algorithm from SO
    let x = ((i & 0xAAAA) >> 1) | ((i & 0x5555) << 1);
    x = ((x & 0xCCCC) >> 2) | ((x & 0x3333) << 2);
    x = ((x & 0xF0F0) >> 4) | ((x & 0x0F0F) << 4);
    rev[i] = (((x & 0xFF00) >> 8) | ((x & 0x00FF) << 8)) >> 1;
}
// create huffman tree from u8 "map": index -> code length for code index
// mb (max bits) must be at most 15
// TODO: optimize/split up?
const hMap = ((cd, mb, r) => {
    const s = cd.length;
    // index
    let i = 0;
    // u16 "map": index -> # of codes with bit length = index
    const l = new u16(mb);
    // length of cd must be 288 (total # of codes)
    for (; i < s; ++i) {
        if (cd[i])
            ++l[cd[i] - 1];
    }
    // u16 "map": index -> minimum code for bit length = index
    const le = new u16(mb);
    for (i = 1; i < mb; ++i) {
        le[i] = (le[i - 1] + l[i - 1]) << 1;
    }
    let co;
    if (r) {
        // u16 "map": index -> number of actual bits, symbol for code
        co = new u16(1 << mb);
        // bits to remove for reverser
        const rvb = 15 - mb;
        for (i = 0; i < s; ++i) {
            // ignore 0 lengths
            if (cd[i]) {
                // num encoding both symbol and bits read
                const sv = (i << 4) | cd[i];
                // free bits
                const r = mb - cd[i];
                // start value
                let v = le[cd[i] - 1]++ << r;
                // m is end value
                for (const m = v | ((1 << r) - 1); v <= m; ++v) {
                    // every 16 bit value starting with the code yields the same result
                    co[rev[v] >> rvb] = sv;
                }
            }
        }
    }
    else {
        co = new u16(s);
        for (i = 0; i < s; ++i) {
            if (cd[i]) {
                co[i] = rev[le[cd[i] - 1]++] >> (15 - cd[i]);
            }
        }
    }
    return co;
});
// fixed length tree
const flt = new u8(288);
for (let i = 0; i < 144; ++i)
    flt[i] = 8;
for (let i = 144; i < 256; ++i)
    flt[i] = 9;
for (let i = 256; i < 280; ++i)
    flt[i] = 7;
for (let i = 280; i < 288; ++i)
    flt[i] = 8;
// fixed distance tree
const fdt = new u8(32);
for (let i = 0; i < 32; ++i)
    fdt[i] = 5;
// fixed length map
const flm = /*#__PURE__*/ hMap(flt, 9, 0), flrm = /*#__PURE__*/ hMap(flt, 9, 1);
// fixed distance map
const fdm = /*#__PURE__*/ hMap(fdt, 5, 0), fdrm = /*#__PURE__*/ hMap(fdt, 5, 1);
// find max of array
const max = (a) => {
    let m = a[0];
    for (let i = 1; i < a.length; ++i) {
        if (a[i] > m)
            m = a[i];
    }
    return m;
};
// read d, starting at bit p and mask with m
const bits = (d, p, m) => {
    const o = (p / 8) | 0;
    return ((d[o] | (d[o + 1] << 8)) >> (p & 7)) & m;
};
// read d, starting at bit p continuing for at least 16 bits
const bits16 = (d, p) => {
    const o = (p / 8) | 0;
    return ((d[o] | (d[o + 1] << 8) | (d[o + 2] << 16)) >> (p & 7));
};
// get end of byte
const shft = (p) => ((p + 7) / 8) | 0;
// typed array slice - allows garbage collector to free original reference,
// while being more compatible than .slice
const slc = (v, s, e) => {
    if (e == null || e > v.length)
        e = v.length;
    // can't use .constructor in case user-supplied
    return new u8(v.subarray(s, e));
};
// error codes
const ec = [
    'unexpected EOF',
    'invalid block type',
    'invalid length/literal',
    'invalid distance',
    'stream finished',
    'no stream handler',
    , // determined by compression function
    'no callback',
    'invalid UTF-8 data',
    'extra field too long',
    'date not in range 1980-2099',
    'filename too long',
    'stream finishing',
    'invalid zip data'
    // determined by unknown compression method
];
const err = (ind, msg, nt) => {
    const e = new Error(msg || ec[ind]);
    e.code = ind;
    if (Error.captureStackTrace)
        Error.captureStackTrace(e, err);
    if (!nt)
        throw e;
    return e;
};
// expands raw DEFLATE data
const inflt = (dat, st, buf, dict) => {
    // source length       dict length
    const sl = dat.length, dl = dict ? dict.length : 0;
    if (!sl || st.f && !st.l)
        return buf || new u8(0);
    const noBuf = !buf;
    // have to estimate size
    const resize = noBuf || st.i != 2;
    // no state
    const noSt = st.i;
    // Assumes roughly 33% compression ratio average
    if (noBuf)
        buf = new u8(sl * 3);
    // ensure buffer can fit at least l elements
    const cbuf = (l) => {
        let bl = buf.length;
        // need to increase size to fit
        if (l > bl) {
            // Double or set to necessary, whichever is greater
            const nbuf = new u8(Math.max(bl * 2, l));
            nbuf.set(buf);
            buf = nbuf;
        }
    };
    //  last chunk         bitpos           bytes
    let final = st.f || 0, pos = st.p || 0, bt = st.b || 0, lm = st.l, dm = st.d, lbt = st.m, dbt = st.n;
    // total bits
    const tbts = sl * 8;
    do {
        if (!lm) {
            // BFINAL - this is only 1 when last chunk is next
            final = bits(dat, pos, 1);
            // type: 0 = no compression, 1 = fixed huffman, 2 = dynamic huffman
            const type = bits(dat, pos + 1, 3);
            pos += 3;
            if (!type) {
                // go to end of byte boundary
                const s = shft(pos) + 4, l = dat[s - 4] | (dat[s - 3] << 8), t = s + l;
                if (t > sl) {
                    if (noSt)
                        err(0);
                    break;
                }
                // ensure size
                if (resize)
                    cbuf(bt + l);
                // Copy over uncompressed data
                buf.set(dat.subarray(s, t), bt);
                // Get new bitpos, update byte count
                st.b = bt += l, st.p = pos = t * 8, st.f = final;
                continue;
            }
            else if (type == 1)
                lm = flrm, dm = fdrm, lbt = 9, dbt = 5;
            else if (type == 2) {
                //  literal                            lengths
                const hLit = bits(dat, pos, 31) + 257, hcLen = bits(dat, pos + 10, 15) + 4;
                const tl = hLit + bits(dat, pos + 5, 31) + 1;
                pos += 14;
                // length+distance tree
                const ldt = new u8(tl);
                // code length tree
                const clt = new u8(19);
                for (let i = 0; i < hcLen; ++i) {
                    // use index map to get real code
                    clt[clim[i]] = bits(dat, pos + i * 3, 7);
                }
                pos += hcLen * 3;
                // code lengths bits
                const clb = max(clt), clbmsk = (1 << clb) - 1;
                // code lengths map
                const clm = hMap(clt, clb, 1);
                for (let i = 0; i < tl;) {
                    const r = clm[bits(dat, pos, clbmsk)];
                    // bits read
                    pos += r & 15;
                    // symbol
                    const s = r >> 4;
                    // code length to copy
                    if (s < 16) {
                        ldt[i++] = s;
                    }
                    else {
                        //  copy   count
                        let c = 0, n = 0;
                        if (s == 16)
                            n = 3 + bits(dat, pos, 3), pos += 2, c = ldt[i - 1];
                        else if (s == 17)
                            n = 3 + bits(dat, pos, 7), pos += 3;
                        else if (s == 18)
                            n = 11 + bits(dat, pos, 127), pos += 7;
                        while (n--)
                            ldt[i++] = c;
                    }
                }
                //    length tree                 distance tree
                const lt = ldt.subarray(0, hLit), dt = ldt.subarray(hLit);
                // max length bits
                lbt = max(lt);
                // max dist bits
                dbt = max(dt);
                lm = hMap(lt, lbt, 1);
                dm = hMap(dt, dbt, 1);
            }
            else
                err(1);
            if (pos > tbts) {
                if (noSt)
                    err(0);
                break;
            }
        }
        // Make sure the buffer can hold this + the largest possible addition
        // Maximum chunk size (practically, theoretically infinite) is 2^17
        if (resize)
            cbuf(bt + 131072);
        const lms = (1 << lbt) - 1, dms = (1 << dbt) - 1;
        let lpos = pos;
        for (;; lpos = pos) {
            // bits read, code
            const c = lm[bits16(dat, pos) & lms], sym = c >> 4;
            pos += c & 15;
            if (pos > tbts) {
                if (noSt)
                    err(0);
                break;
            }
            if (!c)
                err(2);
            if (sym < 256)
                buf[bt++] = sym;
            else if (sym == 256) {
                lpos = pos, lm = undefined;
                break;
            }
            else {
                let add = sym - 254;
                // no extra bits needed if less
                if (sym > 264) {
                    // index
                    const i = sym - 257, b = fleb[i];
                    add = bits(dat, pos, (1 << b) - 1) + fl[i];
                    pos += b;
                }
                // dist
                const d = dm[bits16(dat, pos) & dms], dsym = d >> 4;
                if (!d)
                    err(3);
                pos += d & 15;
                let dt = fd[dsym];
                if (dsym > 3) {
                    const b = fdeb[dsym];
                    dt += bits16(dat, pos) & (1 << b) - 1, pos += b;
                }
                if (pos > tbts) {
                    if (noSt)
                        err(0);
                    break;
                }
                if (resize)
                    cbuf(bt + 131072);
                const end = bt + add;
                if (bt < dt) {
                    const shift = dl - dt, dend = Math.min(dt, end);
                    if (shift + bt < 0)
                        err(3);
                    for (; bt < dend; ++bt)
                        buf[bt] = dict[shift + bt];
                }
                for (; bt < end; ++bt)
                    buf[bt] = buf[bt - dt];
            }
        }
        st.l = lm, st.p = lpos, st.b = bt, st.f = final;
        if (lm)
            final = 1, st.m = lbt, st.d = dm, st.n = dbt;
    } while (!final);
    // don't reallocate for streams or user buffers
    return bt != buf.length && noBuf ? slc(buf, 0, bt) : buf.subarray(0, bt);
};
// starting at p, write the minimum number of bits that can hold v to d
const wbits = (d, p, v) => {
    v <<= p & 7;
    const o = (p / 8) | 0;
    d[o] |= v;
    d[o + 1] |= v >> 8;
};
// starting at p, write the minimum number of bits (>8) that can hold v to d
const wbits16 = (d, p, v) => {
    v <<= p & 7;
    const o = (p / 8) | 0;
    d[o] |= v;
    d[o + 1] |= v >> 8;
    d[o + 2] |= v >> 16;
};
// creates code lengths from a frequency table
const hTree = (d, mb) => {
    // Need extra info to make a tree
    const t = [];
    for (let i = 0; i < d.length; ++i) {
        if (d[i])
            t.push({ s: i, f: d[i] });
    }
    const s = t.length;
    const t2 = t.slice();
    if (!s)
        return { t: et, l: 0 };
    if (s == 1) {
        const v = new u8(t[0].s + 1);
        v[t[0].s] = 1;
        return { t: v, l: 1 };
    }
    t.sort((a, b) => a.f - b.f);
    // after i2 reaches last ind, will be stopped
    // freq must be greater than largest possible number of symbols
    t.push({ s: -1, f: 25001 });
    let l = t[0], r = t[1], i0 = 0, i1 = 1, i2 = 2;
    t[0] = { s: -1, f: l.f + r.f, l, r };
    // efficient algorithm from UZIP.js
    // i0 is lookbehind, i2 is lookahead - after processing two low-freq
    // symbols that combined have high freq, will start processing i2 (high-freq,
    // non-composite) symbols instead
    // see https://reddit.com/r/photopea/comments/ikekht/uzipjs_questions/
    while (i1 != s - 1) {
        l = t[t[i0].f < t[i2].f ? i0++ : i2++];
        r = t[i0 != i1 && t[i0].f < t[i2].f ? i0++ : i2++];
        t[i1++] = { s: -1, f: l.f + r.f, l, r };
    }
    let maxSym = t2[0].s;
    for (let i = 1; i < s; ++i) {
        if (t2[i].s > maxSym)
            maxSym = t2[i].s;
    }
    // code lengths
    const tr = new u16(maxSym + 1);
    // max bits in tree
    let mbt = ln(t[i1 - 1], tr, 0);
    if (mbt > mb) {
        // more algorithms from UZIP.js
        // TODO: find out how this code works (debt)
        //  ind    debt
        let i = 0, dt = 0;
        //    left            cost
        const lft = mbt - mb, cst = 1 << lft;
        t2.sort((a, b) => tr[b.s] - tr[a.s] || a.f - b.f);
        for (; i < s; ++i) {
            const i2 = t2[i].s;
            if (tr[i2] > mb) {
                dt += cst - (1 << (mbt - tr[i2]));
                tr[i2] = mb;
            }
            else
                break;
        }
        dt >>= lft;
        while (dt > 0) {
            const i2 = t2[i].s;
            if (tr[i2] < mb)
                dt -= 1 << (mb - tr[i2]++ - 1);
            else
                ++i;
        }
        for (; i >= 0 && dt; --i) {
            const i2 = t2[i].s;
            if (tr[i2] == mb) {
                --tr[i2];
                ++dt;
            }
        }
        mbt = mb;
    }
    return { t: new u8(tr), l: mbt };
};
// get the max length and assign length codes
const ln = (n, l, d) => {
    return n.s == -1
        ? Math.max(ln(n.l, l, d + 1), ln(n.r, l, d + 1))
        : (l[n.s] = d);
};
// length codes generation
const lc = (c) => {
    let s = c.length;
    // Note that the semicolon was intentional
    while (s && !c[--s])
        ;
    const cl = new u16(++s);
    //  ind      num         streak
    let cli = 0, cln = c[0], cls = 1;
    const w = (v) => { cl[cli++] = v; };
    for (let i = 1; i <= s; ++i) {
        if (c[i] == cln && i != s)
            ++cls;
        else {
            if (!cln && cls > 2) {
                for (; cls > 138; cls -= 138)
                    w(32754);
                if (cls > 2) {
                    w(cls > 10 ? ((cls - 11) << 5) | 28690 : ((cls - 3) << 5) | 12305);
                    cls = 0;
                }
            }
            else if (cls > 3) {
                w(cln), --cls;
                for (; cls > 6; cls -= 6)
                    w(8304);
                if (cls > 2)
                    w(((cls - 3) << 5) | 8208), cls = 0;
            }
            while (cls--)
                w(cln);
            cls = 1;
            cln = c[i];
        }
    }
    return { c: cl.subarray(0, cli), n: s };
};
// calculate the length of output from tree, code lengths
const clen = (cf, cl) => {
    let l = 0;
    for (let i = 0; i < cl.length; ++i)
        l += cf[i] * cl[i];
    return l;
};
// writes a fixed block
// returns the new bit pos
const wfblk = (out, pos, dat) => {
    // no need to write 00 as type: TypedArray defaults to 0
    const s = dat.length;
    const o = shft(pos + 2);
    out[o] = s & 255;
    out[o + 1] = s >> 8;
    out[o + 2] = out[o] ^ 255;
    out[o + 3] = out[o + 1] ^ 255;
    for (let i = 0; i < s; ++i)
        out[o + i + 4] = dat[i];
    return (o + 4 + s) * 8;
};
// writes a block
const wblk = (dat, out, final, syms, lf, df, eb, li, bs, bl, p) => {
    wbits(out, p++, final);
    ++lf[256];
    const { t: dlt, l: mlb } = hTree(lf, 15);
    const { t: ddt, l: mdb } = hTree(df, 15);
    const { c: lclt, n: nlc } = lc(dlt);
    const { c: lcdt, n: ndc } = lc(ddt);
    const lcfreq = new u16(19);
    for (let i = 0; i < lclt.length; ++i)
        ++lcfreq[lclt[i] & 31];
    for (let i = 0; i < lcdt.length; ++i)
        ++lcfreq[lcdt[i] & 31];
    const { t: lct, l: mlcb } = hTree(lcfreq, 7);
    let nlcc = 19;
    for (; nlcc > 4 && !lct[clim[nlcc - 1]]; --nlcc)
        ;
    const flen = (bl + 5) << 3;
    const ftlen = clen(lf, flt) + clen(df, fdt) + eb;
    const dtlen = clen(lf, dlt) + clen(df, ddt) + eb + 14 + 3 * nlcc + clen(lcfreq, lct) + 2 * lcfreq[16] + 3 * lcfreq[17] + 7 * lcfreq[18];
    if (bs >= 0 && flen <= ftlen && flen <= dtlen)
        return wfblk(out, p, dat.subarray(bs, bs + bl));
    let lm, ll, dm, dl;
    wbits(out, p, 1 + (dtlen < ftlen)), p += 2;
    if (dtlen < ftlen) {
        lm = hMap(dlt, mlb, 0), ll = dlt, dm = hMap(ddt, mdb, 0), dl = ddt;
        const llm = hMap(lct, mlcb, 0);
        wbits(out, p, nlc - 257);
        wbits(out, p + 5, ndc - 1);
        wbits(out, p + 10, nlcc - 4);
        p += 14;
        for (let i = 0; i < nlcc; ++i)
            wbits(out, p + 3 * i, lct[clim[i]]);
        p += 3 * nlcc;
        const lcts = [lclt, lcdt];
        for (let it = 0; it < 2; ++it) {
            const clct = lcts[it];
            for (let i = 0; i < clct.length; ++i) {
                const len = clct[i] & 31;
                wbits(out, p, llm[len]), p += lct[len];
                if (len > 15)
                    wbits(out, p, (clct[i] >> 5) & 127), p += clct[i] >> 12;
            }
        }
    }
    else {
        lm = flm, ll = flt, dm = fdm, dl = fdt;
    }
    for (let i = 0; i < li; ++i) {
        const sym = syms[i];
        if (sym > 255) {
            const len = (sym >> 18) & 31;
            wbits16(out, p, lm[len + 257]), p += ll[len + 257];
            if (len > 7)
                wbits(out, p, (sym >> 23) & 31), p += fleb[len];
            const dst = sym & 31;
            wbits16(out, p, dm[dst]), p += dl[dst];
            if (dst > 3)
                wbits16(out, p, (sym >> 5) & 8191), p += fdeb[dst];
        }
        else {
            wbits16(out, p, lm[sym]), p += ll[sym];
        }
    }
    wbits16(out, p, lm[256]);
    return p + ll[256];
};
// deflate options (nice << 13) | chain
const deo = /*#__PURE__*/ new i32([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]);
// empty
const et = /*#__PURE__*/ new u8(0);
// compresses data into a raw DEFLATE buffer
const dflt = (dat, lvl, plvl, pre, post, st) => {
    const s = st.z || dat.length;
    const o = new u8(pre + s + 5 * (1 + Math.ceil(s / 7000)) + post);
    // writing to this writes to the output buffer
    const w = o.subarray(pre, o.length - post);
    const lst = st.l;
    let pos = (st.r || 0) & 7;
    if (lvl) {
        if (pos)
            w[0] = st.r >> 3;
        const opt = deo[lvl - 1];
        const n = opt >> 13, c = opt & 8191;
        const msk = (1 << plvl) - 1;
        //    prev 2-byte val map    curr 2-byte val map
        const prev = st.p || new u16(32768), head = st.h || new u16(msk + 1);
        const bs1 = Math.ceil(plvl / 3), bs2 = 2 * bs1;
        const hsh = (i) => (dat[i] ^ (dat[i + 1] << bs1) ^ (dat[i + 2] << bs2)) & msk;
        // 24576 is an arbitrary number of maximum symbols per block
        // 424 buffer for last block
        const syms = new i32(25000);
        // length/literal freq   distance freq
        const lf = new u16(288), df = new u16(32);
        //  l/lcnt  exbits  index          l/lind  waitdx          blkpos
        let lc = 0, eb = 0, i = st.i || 0, li = 0, wi = st.w || 0, bs = 0;
        for (; i + 2 < s; ++i) {
            // hash value
            const hv = hsh(i);
            // index mod 32768    previous index mod
            let imod = i & 32767, pimod = head[hv];
            prev[imod] = pimod;
            head[hv] = imod;
            // We always should modify head and prev, but only add symbols if
            // this data is not yet processed ("wait" for wait index)
            if (wi <= i) {
                // bytes remaining
                const rem = s - i;
                if ((lc > 7000 || li > 24576) && (rem > 423 || !lst)) {
                    pos = wblk(dat, w, 0, syms, lf, df, eb, li, bs, i - bs, pos);
                    li = lc = eb = 0, bs = i;
                    for (let j = 0; j < 286; ++j)
                        lf[j] = 0;
                    for (let j = 0; j < 30; ++j)
                        df[j] = 0;
                }
                //  len    dist   chain
                let l = 2, d = 0, ch = c, dif = imod - pimod & 32767;
                if (rem > 2 && hv == hsh(i - dif)) {
                    const maxn = Math.min(n, rem) - 1;
                    const maxd = Math.min(32767, i);
                    // max possible length
                    // not capped at dif because decompressors implement "rolling" index population
                    const ml = Math.min(258, rem);
                    while (dif <= maxd && --ch && imod != pimod) {
                        if (dat[i + l] == dat[i + l - dif]) {
                            let nl = 0;
                            for (; nl < ml && dat[i + nl] == dat[i + nl - dif]; ++nl)
                                ;
                            if (nl > l) {
                                l = nl, d = dif;
                                // break out early when we reach "nice" (we are satisfied enough)
                                if (nl > maxn)
                                    break;
                                // now, find the rarest 2-byte sequence within this
                                // length of literals and search for that instead.
                                // Much faster than just using the start
                                const mmd = Math.min(dif, nl - 2);
                                let md = 0;
                                for (let j = 0; j < mmd; ++j) {
                                    const ti = i - dif + j & 32767;
                                    const pti = prev[ti];
                                    const cd = ti - pti & 32767;
                                    if (cd > md)
                                        md = cd, pimod = ti;
                                }
                            }
                        }
                        // check the previous match
                        imod = pimod, pimod = prev[imod];
                        dif += imod - pimod & 32767;
                    }
                }
                // d will be nonzero only when a match was found
                if (d) {
                    // store both dist and len data in one int32
                    // Make sure this is recognized as a len/dist with 28th bit (2^28)
                    syms[li++] = 268435456 | (revfl[l] << 18) | revfd[d];
                    const lin = revfl[l] & 31, din = revfd[d] & 31;
                    eb += fleb[lin] + fdeb[din];
                    ++lf[257 + lin];
                    ++df[din];
                    wi = i + l;
                    ++lc;
                }
                else {
                    syms[li++] = dat[i];
                    ++lf[dat[i]];
                }
            }
        }
        for (i = Math.max(i, wi); i < s; ++i) {
            syms[li++] = dat[i];
            ++lf[dat[i]];
        }
        pos = wblk(dat, w, lst, syms, lf, df, eb, li, bs, i - bs, pos);
        if (!lst) {
            st.r = (pos & 7) | w[(pos / 8) | 0] << 3;
            // shft(pos) now 1 less if pos & 7 != 0
            pos -= 7;
            st.h = head, st.p = prev, st.i = i, st.w = wi;
        }
    }
    else {
        for (let i = st.w || 0; i < s + lst; i += 65535) {
            // end
            let e = i + 65535;
            if (e >= s) {
                // write final block
                w[(pos / 8) | 0] = lst;
                e = s;
            }
            pos = wfblk(w, pos + 1, dat.subarray(i, e));
        }
        st.i = s;
    }
    return slc(o, 0, pre + shft(pos) + post);
};
// Adler32
const adler = () => {
    let a = 1, b = 0;
    return {
        p(d) {
            // closures have awful performance
            let n = a, m = b;
            const l = d.length | 0;
            for (let i = 0; i != l;) {
                const e = Math.min(i + 2655, l);
                for (; i < e; ++i)
                    m += n += d[i];
                n = (n & 65535) + 15 * (n >> 16), m = (m & 65535) + 15 * (m >> 16);
            }
            a = n, b = m;
        },
        d() {
            a %= 65521, b %= 65521;
            return (a & 255) << 24 | (a & 0xFF00) << 8 | (b & 255) << 8 | (b >> 8);
        }
    };
};
// deflate with opts
const dopt = (dat, opt, pre, post, st) => {
    if (!st) {
        st = { l: 1 };
        if (opt.dictionary) {
            const dict = opt.dictionary.subarray(-32768);
            const newDat = new u8(dict.length + dat.length);
            newDat.set(dict);
            newDat.set(dat, dict.length);
            dat = newDat;
            st.w = dict.length;
        }
    }
    return dflt(dat, opt.level == null ? 6 : opt.level, opt.mem == null ? (st.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(dat.length))) * 1.5) : 20) : (12 + opt.mem), pre, post, st);
};
// write bytes
const wbytes = (d, b, v) => {
    for (; v; ++b)
        d[b] = v, v >>>= 8;
};
// zlib header
const zlh = (c, o) => {
    const lv = o.level ?? 0, fl = lv == 0 ? 0 : lv < 6 ? 1 : lv == 9 ? 3 : 2;
    c[0] = 120, c[1] = (fl << 6) | ((o.dictionary ?? 0) && 32);
    c[1] |= 31 - ((c[0] << 8) | c[1]) % 31;
    if (o.dictionary) {
        const h = adler();
        h.p(o.dictionary);
        wbytes(c, 2, h.d());
    }
};
// zlib start
const zls = (d, dict) => {
    if ((d[0] & 15) != 8 || (d[0] >> 4) > 7 || ((d[0] << 8 | d[1]) % 31))
        err(6, 'invalid zlib data');
    if ((d[1] >> 5 & 1) == +!dict)
        err(6, 'invalid zlib data: ' + (d[1] & 32 ? 'need' : 'unexpected') + ' dictionary');
    return (d[1] >> 3 & 4) + 2;
};
// before you yell at me for not just using extends, my reason is that TS inheritance is hard to workerize.
/**
 * Compress data with Zlib
 * @param data The data to compress
 * @param opts The compression options
 * @returns The zlib-compressed version of the data
 */
function zlibSync(data, opts = {}) {
    const a = adler();
    a.p(data);
    const d = dopt(data, opts, opts.dictionary ? 6 : 2, 4);
    return zlh(d, opts), wbytes(d, d.length - 4, a.d()), d;
}
/**
 * Expands Zlib data
 * @param data The data to decompress
 * @param opts The decompression options
 * @returns The decompressed version of the data
 */
function unzlibSync(data, opts = {}) {
    return inflt(data.subarray(zls(data, opts.dictionary), -4), { i: 2 }, opts && opts.out, opts && opts.dictionary);
}

class CRC32 {
    // CRC32 Table 初始化
    static table = Uint32Array.from(Array(256), (_, i) => {
        let c = i;
        for (let j = 0; j < 8; j++) {
            c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
        }
        return c >>> 0;
    });
    static WHITE_COLOR = 0xffffffff;
    caches = new Map();
    calculate(buff) {
        if (!(buff instanceof Uint8Array)) {
            throw new TypeError('Input must be a Uint8Array');
        }
        const { caches } = this;
        const key = platform.decode.bytesToString(buff);
        if (caches.has(key)) {
            return caches.get(key);
        }
        let crc = CRC32.WHITE_COLOR;
        // 使用位运算优化
        for (let i = 0; i < buff.length; i++) {
            crc = (crc >>> 8) ^ CRC32.table[(crc ^ buff[i]) & 0xff];
        }
        caches.set(key, (crc ^ CRC32.WHITE_COLOR) >>> 0);
        return caches.get(key);
    }
    clear() {
        this.caches.clear();
    }
}

// import { zlibSync } from "fflate";
class PNGEncoder {
    width;
    height;
    view;
    crc32 = new CRC32();
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.view = new DataView(new ArrayBuffer(4 * width * height));
    }
    createChunk(type, data) {
        // 长度（4字节，大端序）
        const length = new Uint8Array(4);
        new DataView(length.buffer).setUint32(0, data.length, false);
        // 块类型（4字节， ASCII）
        const chunkType = Uint8Array.from(type, c => c.charCodeAt(0));
        // 计算 CRC32 校验（类型 + 数据）
        const partialChunk = new Uint8Array(chunkType.length + data.length);
        partialChunk.set(chunkType);
        partialChunk.set(data, chunkType.length);
        const crc = new Uint8Array(4);
        new DataView(crc.buffer).setUint32(0, this.crc32.calculate(partialChunk) >>> 0, false);
        // 汇总成完整的chunk数据
        const result = new Uint8Array(length.length + partialChunk.length + crc.length);
        result.set(length);
        result.set(partialChunk, length.length);
        result.set(crc, length.length + partialChunk.length);
        return result;
    }
    createIHDRChunk() {
        const ihdrData = new Uint8Array(13);
        const view = new DataView(ihdrData.buffer);
        // 宽度
        view.setUint32(0, this.width, false);
        // 高度
        view.setUint32(4, this.height, false);
        // 位深度
        view.setUint8(8, 8);
        // 颜色类型
        view.setUint8(9, 6);
        // 压缩方法
        view.setUint8(10, 0);
        // 过滤器方法
        view.setUint8(11, 0);
        // 交错方法
        view.setUint8(12, 0);
        return this.createChunk("IHDR", ihdrData);
    }
    createIDATChunk() {
        const { width, height } = this;
        const validRowSize = width * 4;
        // 每行开头添加一位过滤头数据
        const rowSize = validRowSize + 1;
        const data = new Uint8Array(rowSize * height);
        // 将Uint32数据转换为Uint8数据
        const pixelsData = new Uint8Array(this.view.buffer);
        let startIdx;
        let srcStart;
        for (let y = 0; y < height; y++) {
            startIdx = y * rowSize;
            data[startIdx] = 0x00; // 过滤头
            // ✅ 复制预先转换好的 RGBA 数据
            srcStart = y * validRowSize; // Uint32 => 每个元素占 4 字节
            data.set(pixelsData.subarray(srcStart, srcStart + validRowSize), startIdx + 1);
        }
        // 使用 zlib 进行压缩, 平衡压缩率有利于提升文件生成速度
        return this.createChunk("IDAT", zlibSync(data));
    }
    setPixel(x, y, pixel) {
        this.view.setUint32((y * this.width + x) * 4, pixel, false);
    }
    write(pixels) {
        const { width, height } = this;
        let pos;
        let r;
        let g;
        let b;
        let a;
        let pixel;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                pos = (y * width + x) * 4;
                r = pixels[pos];
                g = pixels[pos + 1];
                b = pixels[pos + 2];
                a = pixels[pos + 3];
                pixel = ((r << 24) | (g << 16) | (b << 8) | a) >>> 0;
                this.setPixel(x, y, pixel);
            }
        }
        return this;
    }
    flush() {
        // 预先创建所有块
        const iHDRChunk = this.createIHDRChunk();
        const iDATChunk = this.createIDATChunk();
        const iENDChunk = this.createChunk("IEND", new Uint8Array(0));
        // 一次性分配内存（直接计算总大小）
        const pngData = new Uint8Array(8 + iHDRChunk.length + iDATChunk.length + iENDChunk.length);
        /* ------ 按顺序写入数据 ------ */
        // 1. 写入文件头（固定 8 字节）
        let offset = 0;
        pngData.set(new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), offset);
        // 2. 写入IHDR块
        offset += 8;
        pngData.set(iHDRChunk, offset);
        // 3. 写入IDAT块
        offset += iHDRChunk.length;
        pngData.set(iDATChunk, offset);
        // 4. 写入IEND块
        offset += iDATChunk.length;
        pngData.set(iENDChunk, offset);
        /* ------ 清空 CRC32 缓存 ------ */
        this.crc32.clear();
        return pngData;
    }
}

// ---------------------------------------------------------------------
// qrBitBuffer
// ---------------------------------------------------------------------
class BitBuffer {
    buffer = [];
    lengthInBits = 0;
    getAt(i) {
        const bufIndex = ~~(i / 8);
        return ((this.buffer[bufIndex] >>> (7 - (i % 8))) & 1) === 1;
    }
    put(num, length) {
        for (let i = 0; i < length; i++) {
            this.putBit(((num >>> (length - i - 1)) & 1) === 1);
        }
    }
    putBit(bit) {
        const { lengthInBits: len, buffer } = this;
        const bufIndex = ~~(len / 8);
        if (buffer.length <= bufIndex) {
            buffer.push(0);
        }
        if (bit) {
            buffer[bufIndex] |= 0x80 >>> len % 8;
        }
        this.lengthInBits += 1;
    }
}

// ---------------------------------------------------------------------
// QRMode
// ---------------------------------------------------------------------
const QRMode = {
    MODE_NUMBER: 1 << 0,
    MODE_ALPHA_NUM: 1 << 1,
    MODE_8BIT_BYTE: 1 << 2,
    MODE_KANJI: 1 << 3,
};
// ---------------------------------------------------------------------
// QRErrorCorrectLevel
// ---------------------------------------------------------------------
const QRErrorCorrectLevel = {
    L: 1,
    M: 0,
    Q: 3,
    H: 2,
};
// ---------------------------------------------------------------------
// QRMaskPattern
// ---------------------------------------------------------------------
const QRMaskPattern = {
    PATTERN000: 0,
    PATTERN001: 1,
    PATTERN010: 2,
    PATTERN011: 3,
    PATTERN100: 4,
    PATTERN101: 5,
    PATTERN110: 6,
    PATTERN111: 7,
};

// ---------------------------------------------------------------------
// qr8BitByte
// ---------------------------------------------------------------------
class BitByte {
    bytes;
    constructor(data) {
        let parsedData = [];
        // Added to support UTF-8 Characters
        for (let i = 0; i < data.length; i++) {
            const byteArray = [];
            const code = data.charCodeAt(i);
            if (code > 0x10000) {
                byteArray[0] = 0xf0 | ((code & 0x1c0000) >>> 18);
                byteArray[1] = 0x80 | ((code & 0x3f000) >>> 12);
                byteArray[2] = 0x80 | ((code & 0xfc0) >>> 6);
                byteArray[3] = 0x80 | (code & 0x3f);
            }
            else if (code > 0x800) {
                byteArray[0] = 0xe0 | ((code & 0xf000) >>> 12);
                byteArray[1] = 0x80 | ((code & 0xfc0) >>> 6);
                byteArray[2] = 0x80 | (code & 0x3f);
            }
            else if (code > 0x80) {
                byteArray[0] = 0xc0 | ((code & 0x7c0) >>> 6);
                byteArray[1] = 0x80 | (code & 0x3f);
            }
            else {
                byteArray[0] = code;
            }
            // Fix Unicode corruption bug
            parsedData.push(byteArray);
        }
        this.bytes = parsedData.flat(1);
        const { bytes } = this;
        if (bytes.length !== data.length) {
            bytes.unshift(191);
            bytes.unshift(187);
            bytes.unshift(239);
        }
    }
    get mode() {
        return QRMode.MODE_8BIT_BYTE;
    }
    get length() {
        return this.bytes.length;
    }
    write(buff) {
        const { bytes } = this;
        for (let i = 0; i < bytes.length; i++) {
            buff.put(bytes[i], 8);
        }
    }
}

// ---------------------------------------------------------------------
// QRRSBlock
// ---------------------------------------------------------------------
const RS_BLOCK_TABLE = [
    [1, 26, 19],
    [1, 26, 16],
    [1, 26, 13],
    [1, 26, 9],
    [1, 44, 34],
    [1, 44, 28],
    [1, 44, 22],
    [1, 44, 16],
    [1, 70, 55],
    [1, 70, 44],
    [2, 35, 17],
    [2, 35, 13],
    [1, 100, 80],
    [2, 50, 32],
    [2, 50, 24],
    [4, 25, 9],
    [1, 134, 108],
    [2, 67, 43],
    [2, 33, 15, 2, 34, 16],
    [2, 33, 11, 2, 34, 12],
    [2, 86, 68],
    [4, 43, 27],
    [4, 43, 19],
    [4, 43, 15],
    [2, 98, 78],
    [4, 49, 31],
    [2, 32, 14, 4, 33, 15],
    [4, 39, 13, 1, 40, 14],
    [2, 121, 97],
    [2, 60, 38, 2, 61, 39],
    [4, 40, 18, 2, 41, 19],
    [4, 40, 14, 2, 41, 15],
    [2, 146, 116],
    [3, 58, 36, 2, 59, 37],
    [4, 36, 16, 4, 37, 17],
    [4, 36, 12, 4, 37, 13],
    [2, 86, 68, 2, 87, 69],
    [4, 69, 43, 1, 70, 44],
    [6, 43, 19, 2, 44, 20],
    [6, 43, 15, 2, 44, 16],
    [4, 101, 81],
    [1, 80, 50, 4, 81, 51],
    [4, 50, 22, 4, 51, 23],
    [3, 36, 12, 8, 37, 13],
    [2, 116, 92, 2, 117, 93],
    [6, 58, 36, 2, 59, 37],
    [4, 46, 20, 6, 47, 21],
    [7, 42, 14, 4, 43, 15],
    [4, 133, 107],
    [8, 59, 37, 1, 60, 38],
    [8, 44, 20, 4, 45, 21],
    [12, 33, 11, 4, 34, 12],
    [3, 145, 115, 1, 146, 116],
    [4, 64, 40, 5, 65, 41],
    [11, 36, 16, 5, 37, 17],
    [11, 36, 12, 5, 37, 13],
    [5, 109, 87, 1, 110, 88],
    [5, 65, 41, 5, 66, 42],
    [5, 54, 24, 7, 55, 25],
    [11, 36, 12],
    [5, 122, 98, 1, 123, 99],
    [7, 73, 45, 3, 74, 46],
    [15, 43, 19, 2, 44, 20],
    [3, 45, 15, 13, 46, 16],
    [1, 135, 107, 5, 136, 108],
    [10, 74, 46, 1, 75, 47],
    [1, 50, 22, 15, 51, 23],
    [2, 42, 14, 17, 43, 15],
    [5, 150, 120, 1, 151, 121],
    [9, 69, 43, 4, 70, 44],
    [17, 50, 22, 1, 51, 23],
    [2, 42, 14, 19, 43, 15],
    [3, 141, 113, 4, 142, 114],
    [3, 70, 44, 11, 71, 45],
    [17, 47, 21, 4, 48, 22],
    [9, 39, 13, 16, 40, 14],
    [3, 135, 107, 5, 136, 108],
    [3, 67, 41, 13, 68, 42],
    [15, 54, 24, 5, 55, 25],
    [15, 43, 15, 10, 44, 16],
    [4, 144, 116, 4, 145, 117],
    [17, 68, 42],
    [17, 50, 22, 6, 51, 23],
    [19, 46, 16, 6, 47, 17],
    [2, 139, 111, 7, 140, 112],
    [17, 74, 46],
    [7, 54, 24, 16, 55, 25],
    [34, 37, 13],
    [4, 151, 121, 5, 152, 122],
    [4, 75, 47, 14, 76, 48],
    [11, 54, 24, 14, 55, 25],
    [16, 45, 15, 14, 46, 16],
    [6, 147, 117, 4, 148, 118],
    [6, 73, 45, 14, 74, 46],
    [11, 54, 24, 16, 55, 25],
    [30, 46, 16, 2, 47, 17],
    [8, 132, 106, 4, 133, 107],
    [8, 75, 47, 13, 76, 48],
    [7, 54, 24, 22, 55, 25],
    [22, 45, 15, 13, 46, 16],
    [10, 142, 114, 2, 143, 115],
    [19, 74, 46, 4, 75, 47],
    [28, 50, 22, 6, 51, 23],
    [33, 46, 16, 4, 47, 17],
    [8, 152, 122, 4, 153, 123],
    [22, 73, 45, 3, 74, 46],
    [8, 53, 23, 26, 54, 24],
    [12, 45, 15, 28, 46, 16],
    [3, 147, 117, 10, 148, 118],
    [3, 73, 45, 23, 74, 46],
    [4, 54, 24, 31, 55, 25],
    [11, 45, 15, 31, 46, 16],
    [7, 146, 116, 7, 147, 117],
    [21, 73, 45, 7, 74, 46],
    [1, 53, 23, 37, 54, 24],
    [19, 45, 15, 26, 46, 16],
    [5, 145, 115, 10, 146, 116],
    [19, 75, 47, 10, 76, 48],
    [15, 54, 24, 25, 55, 25],
    [23, 45, 15, 25, 46, 16],
    [13, 145, 115, 3, 146, 116],
    [2, 74, 46, 29, 75, 47],
    [42, 54, 24, 1, 55, 25],
    [23, 45, 15, 28, 46, 16],
    [17, 145, 115],
    [10, 74, 46, 23, 75, 47],
    [10, 54, 24, 35, 55, 25],
    [19, 45, 15, 35, 46, 16],
    [17, 145, 115, 1, 146, 116],
    [14, 74, 46, 21, 75, 47],
    [29, 54, 24, 19, 55, 25],
    [11, 45, 15, 46, 46, 16],
    [13, 145, 115, 6, 146, 116],
    [14, 74, 46, 23, 75, 47],
    [44, 54, 24, 7, 55, 25],
    [59, 46, 16, 1, 47, 17],
    [12, 151, 121, 7, 152, 122],
    [12, 75, 47, 26, 76, 48],
    [39, 54, 24, 14, 55, 25],
    [22, 45, 15, 41, 46, 16],
    [6, 151, 121, 14, 152, 122],
    [6, 75, 47, 34, 76, 48],
    [46, 54, 24, 10, 55, 25],
    [2, 45, 15, 64, 46, 16],
    [17, 152, 122, 4, 153, 123],
    [29, 74, 46, 14, 75, 47],
    [49, 54, 24, 10, 55, 25],
    [24, 45, 15, 46, 46, 16],
    [4, 152, 122, 18, 153, 123],
    [13, 74, 46, 32, 75, 47],
    [48, 54, 24, 14, 55, 25],
    [42, 45, 15, 32, 46, 16],
    [20, 147, 117, 4, 148, 118],
    [40, 75, 47, 7, 76, 48],
    [43, 54, 24, 22, 55, 25],
    [10, 45, 15, 67, 46, 16],
    [19, 148, 118, 6, 149, 119],
    [18, 75, 47, 31, 76, 48],
    [34, 54, 24, 34, 55, 25],
    [20, 45, 15, 61, 46, 16],
];
class RSBlock {
    getRSBlockTable(typeNumber, errorCorrectLevel) {
        const { L, M, Q, H } = QRErrorCorrectLevel;
        const pos = (typeNumber - 1) * 4;
        switch (errorCorrectLevel) {
            case L:
                return RS_BLOCK_TABLE[pos + 0];
            case M:
                return RS_BLOCK_TABLE[pos + 1];
            case Q:
                return RS_BLOCK_TABLE[pos + 2];
            case H:
                return RS_BLOCK_TABLE[pos + 3];
            default:
                throw new Error(`bad rs block @ typeNumber:${typeNumber}/errorCorrectLevel: ${errorCorrectLevel}`);
        }
    }
    getRSBlocks(typeNumber, errorCorrectLevel) {
        const rsBlock = this.getRSBlockTable(typeNumber, errorCorrectLevel);
        const length = rsBlock.length / 3;
        const list = [];
        for (let i = 0; i < length; i++) {
            const count = rsBlock[i * 3];
            const totalCount = rsBlock[i * 3 + 1];
            const dataCount = rsBlock[i * 3 + 2];
            for (let j = 0; j < count; j++) {
                list.push({ totalCount, dataCount });
            }
        }
        return list;
    }
}

// ---------------------------------------------------------------------
// QRMath
// ---------------------------------------------------------------------
const EXP_TABLE = new Array(256);
const LOG_TABLE = new Array(256);
// initialize tables
for (let i = 0; i < 8; i++) {
    EXP_TABLE[i] = 1 << i;
}
for (let i = 8; i < 256; i++) {
    EXP_TABLE[i] = EXP_TABLE[i - 4] ^ EXP_TABLE[i - 5] ^ EXP_TABLE[i - 6] ^ EXP_TABLE[i - 8];
}
for (let i = 0; i < 255; i++) {
    LOG_TABLE[EXP_TABLE[i]] = i;
}
const QRMath = {
    glog(n) {
        if (n < 1) {
            throw new Error(`glog(${n})`);
        }
        return LOG_TABLE[n];
    },
    gexp(n) {
        if (n < 0) {
            n = 255 + (n % 255);
        }
        else if (n > 255) {
            n %= 255;
        }
        return EXP_TABLE[n];
    }
};

// ---------------------------------------------------------------------
// Polynomial
// ---------------------------------------------------------------------
class Polynomial {
    num;
    constructor(num, shift) {
        const { length } = num;
        if (length === undefined) {
            throw new Error(`${length}/${shift}`);
        }
        let offset = 0;
        while (offset < length && num[offset] === 0) {
            offset++;
        }
        const len = length - offset;
        this.num = new Array(len + shift);
        for (let i = 0; i < len; i++) {
            this.num[i] = num[i + offset];
        }
    }
    get length() {
        return this.num.length;
    }
    getAt(i) {
        return this.num[i];
    }
    multiply(e) {
        const { glog, gexp } = QRMath;
        const num = [];
        for (let i = 0; i < this.length; i++) {
            for (let j = 0; j < e.length; j++) {
                num[i + j] ^= gexp(glog(this.getAt(i)) + glog(e.getAt(j)));
            }
        }
        return new Polynomial(num, 0);
    }
    mod(e) {
        if (this.length - e.length < 0) {
            return this;
        }
        const { glog, gexp } = QRMath;
        const ratio = glog(this.getAt(0)) - glog(e.getAt(0));
        const num = [];
        for (var i = 0; i < this.length; i++) {
            const n = this.getAt(i);
            num[i] = i < e.length ? n ^ gexp(glog(e.getAt(i)) + ratio) : n;
        }
        // recursive call
        return new Polynomial(num, 0).mod(e);
    }
}

const PATTERN_POSITION_TABLE = [
    [],
    [6, 18],
    [6, 22],
    [6, 26],
    [6, 30],
    [6, 34],
    [6, 22, 38],
    [6, 24, 42],
    [6, 26, 46],
    [6, 28, 50],
    [6, 30, 54],
    [6, 32, 58],
    [6, 34, 62],
    [6, 26, 46, 66],
    [6, 26, 48, 70],
    [6, 26, 50, 74],
    [6, 30, 54, 78],
    [6, 30, 56, 82],
    [6, 30, 58, 86],
    [6, 34, 62, 90],
    [6, 28, 50, 72, 94],
    [6, 26, 50, 74, 98],
    [6, 30, 54, 78, 102],
    [6, 28, 54, 80, 106],
    [6, 32, 58, 84, 110],
    [6, 30, 58, 86, 114],
    [6, 34, 62, 90, 118],
    [6, 26, 50, 74, 98, 122],
    [6, 30, 54, 78, 102, 126],
    [6, 26, 52, 78, 104, 130],
    [6, 30, 56, 82, 108, 134],
    [6, 34, 60, 86, 112, 138],
    [6, 30, 58, 86, 114, 142],
    [6, 34, 62, 90, 118, 146],
    [6, 30, 54, 78, 102, 126, 150],
    [6, 24, 50, 76, 102, 128, 154],
    [6, 28, 54, 80, 106, 132, 158],
    [6, 32, 58, 84, 110, 136, 162],
    [6, 26, 54, 82, 110, 138, 166],
    [6, 30, 58, 86, 114, 142, 170],
];
const G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
const G18 = (1 << 12) |
    (1 << 11) |
    (1 << 10) |
    (1 << 9) |
    (1 << 8) |
    (1 << 5) |
    (1 << 2) |
    (1 << 0);
const G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);
const genBCHDigit = (data) => data === 0 ? 0 : Math.log2(data);
const BCH_G15 = genBCHDigit(G15);
const BCH_G18 = genBCHDigit(G18);
// ---------------------------------------------------------------------
// QRUtil
// ---------------------------------------------------------------------
const Util = {
    getBCHTypeInfo(data) {
        let d = data << 10;
        while (genBCHDigit(d) - BCH_G15 >= 0) {
            d ^= G15 << (genBCHDigit(d) - BCH_G15);
        }
        return ((data << 10) | d) ^ G15_MASK;
    },
    getBCHTypeNumber(data) {
        let d = data << 12;
        while (genBCHDigit(d) - BCH_G18 >= 0) {
            d ^= G18 << (genBCHDigit(d) - BCH_G18);
        }
        return (data << 12) | d;
    },
    getPatternPosition(typeNumber) {
        return PATTERN_POSITION_TABLE[typeNumber - 1];
    },
    getMaskFunction(maskPattern) {
        const { PATTERN000, PATTERN001, PATTERN010, PATTERN011, PATTERN100, PATTERN101, PATTERN110, PATTERN111, } = QRMaskPattern;
        switch (maskPattern) {
            case PATTERN000:
                return (i, j) => (i + j) % 2 === 0;
            case PATTERN001:
                return (i) => i % 2 === 0;
            case PATTERN010:
                return (_i, j) => j % 3 === 0;
            case PATTERN011:
                return (i, j) => (i + j) % 3 === 0;
            case PATTERN100:
                return (i, j) => (~~(i / 2) + ~~(j / 3)) % 2 === 0;
            case PATTERN101:
                return (i, j) => ((i * j) % 2) + ((i * j) % 3) === 0;
            case PATTERN110:
                return (i, j) => (((i * j) % 2) + ((i * j) % 3)) % 2 === 0;
            case PATTERN111:
                return (i, j) => (((i * j) % 3) + ((i + j) % 2)) % 2 === 0;
            default:
                throw new Error(`bad maskPattern: ${maskPattern}`);
        }
    },
    getErrorCorrectPolynomial(errorCorrectLength) {
        let a = new Polynomial([1], 0);
        for (let i = 0; i < errorCorrectLength; i++) {
            a = a.multiply(new Polynomial([1, QRMath.gexp(i)], 0));
        }
        return a;
    },
    getLengthInBits(mode, type) {
        const { MODE_NUMBER, MODE_ALPHA_NUM, MODE_8BIT_BYTE, MODE_KANJI } = QRMode;
        if (type < 1 || type > 40) {
            throw new Error(`type: ${type}`);
        }
        if (type >= 1 && type < 10) {
            // 1 - 9
            switch (mode) {
                case MODE_NUMBER:
                    return 10;
                case MODE_ALPHA_NUM:
                    return 9;
                case MODE_8BIT_BYTE:
                    return 8;
                case MODE_KANJI:
                    return 8;
            }
        }
        if (type < 27) {
            // 10 - 26
            switch (mode) {
                case MODE_NUMBER:
                    return 12;
                case MODE_ALPHA_NUM:
                    return 11;
                case MODE_8BIT_BYTE:
                    return 16;
                case MODE_KANJI:
                    return 10;
            }
        }
        if (type <= 40) {
            // 27 - 40
            switch (mode) {
                case MODE_NUMBER:
                    return 14;
                case MODE_ALPHA_NUM:
                    return 13;
                case MODE_8BIT_BYTE:
                    return 16;
                case MODE_KANJI:
                    return 12;
            }
        }
        throw new Error(`mode: ${mode}`);
    },
    getLostPoint(qr) {
        const moduleCount = qr.getModuleCount();
        let lostPoint = 0;
        // LEVEL1
        for (let row = 0; row < moduleCount; row++) {
            for (let col = 0; col < moduleCount; col++) {
                const dark = qr.isDark(row, col);
                let sameCount = 0;
                for (let r = -1; r <= 1; r++) {
                    const nRow = row + r;
                    if (nRow < 0 || moduleCount <= nRow)
                        continue;
                    for (let c = -1; c <= 1; c++) {
                        const nCol = col + c;
                        if (nCol < 0 || moduleCount <= nCol)
                            continue;
                        if (r === 0 && c === 0)
                            continue;
                        if (dark === qr.isDark(nRow, nCol)) {
                            sameCount++;
                        }
                    }
                }
                if (sameCount > 5) {
                    lostPoint += sameCount + 3 - 5;
                }
            }
        }
        // LEVEL2
        for (let row = 0; row < moduleCount - 1; row++) {
            for (let col = 0; col < moduleCount - 1; col++) {
                let count = 0;
                if (qr.isDark(row, col))
                    count++;
                if (qr.isDark(row + 1, col))
                    count++;
                if (qr.isDark(row, col + 1))
                    count++;
                if (qr.isDark(row + 1, col + 1))
                    count++;
                if (count === 0 || count === 4) {
                    lostPoint += 3;
                }
            }
        }
        // LEVEL3
        for (let row = 0; row < moduleCount; row++) {
            for (let col = 0; col < moduleCount - 6; col++) {
                if (qr.isDark(row, col) &&
                    !qr.isDark(row, col + 1) &&
                    qr.isDark(row, col + 2) &&
                    qr.isDark(row, col + 3) &&
                    qr.isDark(row, col + 4) &&
                    !qr.isDark(row, col + 5) &&
                    qr.isDark(row, col + 6)) {
                    lostPoint += 40;
                }
            }
        }
        for (let col = 0; col < moduleCount; col++) {
            for (let row = 0; row < moduleCount - 6; row++) {
                if (qr.isDark(row, col) &&
                    !qr.isDark(row + 1, col) &&
                    qr.isDark(row + 2, col) &&
                    qr.isDark(row + 3, col) &&
                    qr.isDark(row + 4, col) &&
                    !qr.isDark(row + 5, col) &&
                    qr.isDark(row + 6, col)) {
                    lostPoint += 40;
                }
            }
        }
        // LEVEL4
        let darkCount = 0;
        for (let col = 0; col < moduleCount; col++) {
            for (let row = 0; row < moduleCount; row++) {
                if (qr.isDark(row, col)) {
                    darkCount++;
                }
            }
        }
        const ratio = Math.abs((100 * darkCount) / Math.pow(moduleCount, 2) - 50) / 5;
        return lostPoint + ratio * 10;
    },
};

// ---------------------------------------------------------------------
//
// QR Code Generator for JavaScript
//
// Copyright (c) 2025 LiHZSky
//
// URL: http://www.d-project.com/
//
// Licensed under the MIT license:
// http://www.opensource.org/licenses/mit-license.php
//
// The word 'QR Code' is registered trademark of
// DENSO WAVE INCORPORATED
//
// ---------------------------------------------------------------------
const PAD0 = 0xec;
const PAD1 = 0x11;
/**
 * QRCode实现
 * https://www.cnblogs.com/leestar54/p/15782929.html
 * @param typeNumber 1 to 40
 * @param errorCorrectLevel 'L','M','Q','H'
 */
class QRCode {
    typeNumber;
    errorCorrectLevel;
    modules = [];
    moduleCount = 0;
    dataCache = null;
    dataList = [];
    constructor(typeNumber, errorCorrectLevel) {
        this.typeNumber = typeNumber;
        this.errorCorrectLevel = QRErrorCorrectLevel[errorCorrectLevel];
    }
    makeImpl(test, maskPattern) {
        this.moduleCount = this.typeNumber * 4 + 17;
        this.modules = ((moduleCount) => {
            const modules = [];
            // 预设一个 moduleCount * moduleCount 的空白矩阵
            for (let row = 0; row < moduleCount; row++) {
                modules[row] = [];
                for (let col = 0; col < moduleCount; col++) {
                    modules[row][col] = null;
                }
            }
            return modules;
        })(this.moduleCount);
        const count = this.moduleCount - 7;
        this.setupPositionProbePattern(0, 0);
        this.setupPositionProbePattern(count, 0);
        this.setupPositionProbePattern(0, count);
        this.setupPositionAdjustPattern();
        this.setupTimingPattern();
        this.setupTypeInfo(test, maskPattern);
        if (this.typeNumber >= 7) {
            this.setupTypeNumber(test);
        }
        if (this.dataCache === null) {
            this.dataCache = this.createData(this.typeNumber, this.errorCorrectLevel, this.dataList);
        }
        this.mapData(this.dataCache, maskPattern);
    }
    setupPositionProbePattern(row, col) {
        const { modules, moduleCount } = this;
        for (let r = -1; r <= 7; r++) {
            const nr = row + r;
            if (nr <= -1 || moduleCount <= nr)
                continue;
            for (let c = -1; c <= 7; c++) {
                const nc = col + c;
                if (nc <= -1 || moduleCount <= nc)
                    continue;
                modules[nr][nc] =
                    (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
                        (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
                        (r >= 2 && r <= 4 && c >= 2 && c <= 4);
            }
        }
    }
    setupPositionAdjustPattern() {
        const { typeNumber, modules } = this;
        const pos = Util.getPatternPosition(typeNumber);
        const { length } = pos;
        for (let i = 0; i < length; i++) {
            for (let j = 0; j < length; j++) {
                const row = pos[i];
                const col = pos[j];
                if (modules[row][col] != null)
                    continue;
                for (let r = -2; r <= 2; r++) {
                    for (let c = -2; c <= 2; c++) {
                        modules[row + r][col + c] =
                            r === -2 || r === 2 || c === -2 || c === 2 || (r === 0 && c === 0);
                    }
                }
            }
        }
    }
    setupTimingPattern() {
        const { moduleCount, modules } = this;
        const count = moduleCount - 8;
        for (let r = 8; r < count; r++) {
            if (modules[r][6] != null)
                continue;
            modules[r][6] = r % 2 === 0;
        }
        for (let c = 8; c < count; c++) {
            if (modules[6][c] != null)
                continue;
            modules[6][c] = c % 2 === 0;
        }
    }
    setupTypeInfo(test, maskPattern) {
        const { errorCorrectLevel, modules, moduleCount } = this;
        const data = (errorCorrectLevel << 3) | maskPattern;
        const bits = Util.getBCHTypeInfo(data);
        // vertical
        for (let i = 0; i < 15; i++) {
            const mod = !test && ((bits >> i) & 1) === 1;
            if (i < 6) {
                modules[i][8] = mod;
            }
            else if (i < 8) {
                modules[i + 1][8] = mod;
            }
            else {
                modules[moduleCount - 15 + i][8] = mod;
            }
        }
        // horizontal
        for (let i = 0; i < 15; i++) {
            const mod = !test && ((bits >> i) & 1) === 1;
            if (i < 8) {
                modules[8][moduleCount - i - 1] = mod;
            }
            else if (i < 9) {
                modules[8][15 - i] = mod;
            }
            else {
                modules[8][15 - i - 1] = mod;
            }
        }
        // fixed module
        modules[moduleCount - 8][8] = !test;
    }
    getBestMaskPattern() {
        let minLostPoint = 0;
        let pattern = 0;
        for (let i = 0; i < 8; i++) {
            this.makeImpl(true, i);
            const lostPoint = Util.getLostPoint(this);
            if (i === 0 || minLostPoint > lostPoint) {
                minLostPoint = lostPoint;
                pattern = i;
            }
        }
        return pattern;
    }
    setupTypeNumber(test) {
        const { typeNumber, modules, moduleCount } = this;
        const bits = Util.getBCHTypeNumber(typeNumber);
        for (let i = 0; i < 18; i++) {
            const mod = !test && ((bits >> i) & 1) === 1;
            modules[~~(i / 3)][(i % 3) + moduleCount - 8 - 3] = mod;
            modules[(i % 3) + moduleCount - 8 - 3][~~(i / 3)] = mod;
        }
    }
    createData(typeNumber, errorCorrectLevel, dataList) {
        const rsBlocks = new RSBlock().getRSBlocks(typeNumber, errorCorrectLevel);
        const buffer = new BitBuffer();
        for (let i = 0; i < dataList.length; i++) {
            const data = dataList[i];
            buffer.put(data.mode, 4);
            buffer.put(data.length, Util.getLengthInBits(data.mode, typeNumber));
            data.write(buffer);
        }
        // calc num max data.
        let totalDataCount = 0;
        for (let i = 0; i < rsBlocks.length; i++) {
            totalDataCount += rsBlocks[i].dataCount;
        }
        const totalCount = totalDataCount * 8;
        if (buffer.lengthInBits > totalCount) {
            throw new Error(`code length overflow. (${buffer.lengthInBits} > ${totalCount})`);
        }
        // end code
        if (buffer.lengthInBits + 4 <= totalCount) {
            buffer.put(0, 4);
        }
        // padding
        while (buffer.lengthInBits % 8 !== 0) {
            buffer.putBit(false);
        }
        // padding
        while (true) {
            if (buffer.lengthInBits >= totalCount) {
                break;
            }
            buffer.put(PAD0, 8);
            if (buffer.lengthInBits >= totalCount) {
                break;
            }
            buffer.put(PAD1, 8);
        }
        return this.createBytes(buffer, rsBlocks);
    }
    mapData(data, maskPattern) {
        const { modules, moduleCount } = this;
        const maskFunc = Util.getMaskFunction(maskPattern);
        let inc = -1;
        let row = moduleCount - 1;
        let bitIndex = 7;
        let byteIndex = 0;
        for (let col = row; col > 0; col -= 2) {
            if (col === 6)
                col -= 1;
            while (true) {
                for (let c = 0; c < 2; c++) {
                    if (modules[row][col - c] == null) {
                        let dark = false;
                        if (byteIndex < data.length) {
                            dark = ((data[byteIndex] >>> bitIndex) & 1) === 1;
                        }
                        if (maskFunc(row, col - c)) {
                            dark = !dark;
                        }
                        modules[row][col - c] = dark;
                        bitIndex--;
                        if (bitIndex === -1) {
                            byteIndex++;
                            bitIndex = 7;
                        }
                    }
                }
                row += inc;
                if (row < 0 || moduleCount <= row) {
                    row -= inc;
                    inc = -inc;
                    break;
                }
            }
        }
    }
    createBytes(bitBuffer, rsBlocks) {
        const dcdata = [];
        const ecdata = [];
        let offset = 0;
        let maxDcCount = 0;
        let maxEcCount = 0;
        for (let r = 0; r < rsBlocks.length; r++) {
            const dcCount = rsBlocks[r].dataCount;
            const ecCount = rsBlocks[r].totalCount - dcCount;
            maxDcCount = Math.max(maxDcCount, dcCount);
            maxEcCount = Math.max(maxEcCount, ecCount);
            dcdata[r] = [];
            for (let i = 0; i < dcCount; i++) {
                dcdata[r][i] = 0xff & bitBuffer.buffer[i + offset];
            }
            offset += dcCount;
            const rsPoly = Util.getErrorCorrectPolynomial(ecCount);
            const rawPoly = new Polynomial(dcdata[r], rsPoly.length - 1);
            const modPoly = rawPoly.mod(rsPoly);
            ecdata[r] = new Array(rsPoly.length - 1);
            for (let i = 0; i < ecdata[r].length; i++) {
                const modIndex = i + modPoly.length - ecdata[r].length;
                ecdata[r][i] = modIndex >= 0 ? modPoly.getAt(modIndex) : 0;
            }
        }
        let totalCodeCount = 0;
        for (let i = 0; i < rsBlocks.length; i++) {
            totalCodeCount += rsBlocks[i].totalCount;
        }
        const data = new Array(totalCodeCount);
        let index = 0;
        for (let i = 0; i < maxDcCount; i++) {
            for (let r = 0; r < rsBlocks.length; r++) {
                if (i < dcdata[r].length) {
                    data[index++] = dcdata[r][i];
                }
            }
        }
        for (let i = 0; i < maxEcCount; i++) {
            for (let r = 0; r < rsBlocks.length; r++) {
                if (i < ecdata[r].length) {
                    data[index++] = ecdata[r][i];
                }
            }
        }
        return data;
    }
    isDark(row, col) {
        const { moduleCount } = this;
        if (row < 0 || moduleCount <= row || col < 0 || moduleCount <= col) {
            throw new Error(`${row}, ${col}`);
        }
        return this.modules[row][col];
    }
    addData(data) {
        this.dataList.push(new BitByte(data));
        this.dataCache = null;
    }
    getModuleCount() {
        return this.moduleCount;
    }
    make() {
        this.makeImpl(false, this.getBestMaskPattern());
    }
}

// import { unzlibSync } from "fflate";
/**
 * SVGA 下载解析器
 */
class Parser {
    /**
     * 解压视频源文件
     * @param data
     * @returns
     */
    static decompress(data) {
        return unzlibSync(new Uint8Array(data)).buffer;
    }
    /**
     * 解析视频实体
     * @param data 视频二进制数据
     * @param url 视频地址
     * @param needDecompress 是否解压
     * @returns
     */
    static parseVideo(data, url, needDecompress = true) {
        return createVideoEntity(new Uint8Array(needDecompress ? this.decompress(data) : data), platform.path.filename(url));
    }
    /**
     * 读取文件资源
     * @param url 文件资源地址
     * @returns
     */
    static async download(url) {
        const { globals, remote, path, local } = platform;
        const { env } = globals;
        const supportLocal = env !== "h5" && env !== "tt";
        const filepath = path.is(url)
            ? url
            : path.resolve(path.filename(url));
        // 本地读取
        if (supportLocal) {
            if (await local.exists(filepath)) {
                return local.read(filepath);
            }
        }
        // 远程读取
        const buff = await remote.fetch(url);
        // 本地缓存
        if (supportLocal) {
            try {
                await local.write(buff, filepath);
            }
            catch (ex) {
                // eslint-disable-next-line no-console
                console.error(ex);
            }
        }
        return buff;
    }
    /**
     * 通过 url 下载并解析 SVGA 文件
     * @param url SVGA 文件的下载链接
     * @returns Promise<SVGA 数据源
     */
    static async load(url) {
        return Parser.parseVideo((await Parser.download(url)), url);
    }
}

const { noop } = platform;
class Painter {
    mode;
    /**
     * 主屏的 Canvas 元素
     * Front Screen
     */
    F = null;
    /**
     * 主屏的 Context 对象
     * Front Context
     */
    FC = null;
    /**
     * 副屏的 Canvas 元素
     * Background Screen
     */
    B = null;
    /**
     * 副屏的 Context 对象
     * Background Context
     */
    BC = null;
    /**
     * 画布的宽度
     */
    W;
    /**
     * 画布的高度
     */
    H;
    /**
     * 粉刷模式
     */
    model = {};
    /**
     *
     * @param mode
     *  - poster: 海报模式
     *  - animation: 动画模式
     *  - 默认为 animation
     * @param W 海报模式必须传入
     * @param H 海报模式必须传入
     */
    constructor(mode = "animation", width = 0, height = 0) {
        this.mode = mode;
        const { dpr } = platform.globals;
        this.W = width * dpr;
        this.H = height * dpr;
    }
    /**
     * 设置 Canvas 的处理模式
     * - C：代表 Canvas
     * - O：代表 OffscreenCanvas
     */
    setActionModel(type) {
        const { model } = this;
        const { env } = platform.globals;
        // set type
        model.type = type;
        // set clear
        if (type === "O" &&
            // OffscreenCanvas 在 Firefox 浏览器无法被清理历史内容
            env === "h5" &&
            navigator.userAgent.includes("Firefox")) {
            model.clear = "CR";
        }
        else if ((type === "O" && env === "tt") || env === "alipay") {
            model.clear = "CL";
        }
        else {
            model.clear = "RE";
        }
    }
    /**
     * 注册画笔，根据环境判断生成最优的绘制方式
     * @param selector
     * @param ofsSelector
     * @param component
     */
    async register(selector, ofsSelector, component) {
        const { model, mode } = this;
        const { getCanvas, getOfsCanvas } = platform;
        const { env } = platform.globals;
        // #region set main screen implement
        // -------- 创建主屏 ---------
        if (mode === "poster" &&
            (env !== "h5" || "OffscreenCanvas" in globalThis)) {
            const { W, H } = this;
            const { canvas, context } = getOfsCanvas({ width: W, height: H });
            this.F = canvas;
            this.FC = context;
            this.setActionModel("O");
        }
        else {
            const { canvas, context } = await getCanvas(selector, component);
            const { width, height } = canvas;
            // 添加主屏
            this.F = canvas;
            this.FC = context;
            this.setActionModel("C");
            if (mode === "poster") {
                canvas.width = this.W;
                canvas.height = this.H;
            }
            else {
                this.W = width;
                this.H = height;
            }
        }
        // #endregion set main screen implement
        // #region clear main screen implement
        // ------- 生成主屏清理函数 -------
        // FIXME:【支付宝小程序】无法通过改变尺寸来清理画布
        if (model.clear === "CL") {
            this.clearContainer = () => {
                const { W, H, FC } = this;
                FC.clearRect(0, 0, W, H);
            };
        }
        else {
            this.clearContainer = () => {
                const { W, H, F } = this;
                F.width = W;
                F.height = H;
            };
        }
        // #endregion clear main screen implement
        if (mode === "poster") {
            this.B = this.F;
            this.BC = this.FC;
            this.clearSecondary = this.stick = noop;
        }
        else {
            // #region set secondary screen implement
            // ------- 创建副屏 ---------
            const { W, H } = this;
            let ofsResult;
            if (typeof ofsSelector === "string" && ofsSelector !== "") {
                ofsResult = await getCanvas(ofsSelector, component);
                ofsResult.canvas.width = W;
                ofsResult.canvas.height = H;
                this.setActionModel("C");
            }
            else {
                ofsResult = getOfsCanvas({ width: W, height: H });
                this.setActionModel("O");
            }
            this.B = ofsResult.canvas;
            this.BC = ofsResult.context;
            // #endregion set secondary screen implement
            // #region clear secondary screen implement
            // ------- 生成副屏清理函数 --------
            switch (model.clear) {
                case "CR":
                    this.clearSecondary = () => {
                        const { W, H } = this;
                        // FIXME:【支付宝小程序】频繁创建新的 OffscreenCanvas 会出现崩溃现象
                        const { canvas, context } = getOfsCanvas({ width: W, height: H });
                        this.B = canvas;
                        this.BC = context;
                    };
                    break;
                case "CL":
                    this.clearSecondary = () => {
                        const { W, H, BC } = this;
                        // FIXME:【支付宝小程序】无法通过改变尺寸来清理画布，无论是Canvas还是OffscreenCanvas
                        BC.clearRect(0, 0, W, H);
                    };
                    break;
                default:
                    this.clearSecondary = () => {
                        const { W, H, B } = this;
                        B.width = W;
                        B.height = H;
                    };
            }
            // #endregion clear secondary screen implement
        }
    }
    clearContainer = noop;
    clearSecondary = noop;
    stick() {
        const { W, H, FC, BC, mode } = this;
        if (mode !== "poster") {
            FC.drawImage(BC.canvas, 0, 0, W, H);
        }
    }
    /**
     * 销毁画笔
     */
    destroy() {
        this.clearContainer();
        this.clearSecondary();
        this.F = this.FC = this.B = this.BC = null;
        this.clearContainer = this.clearSecondary = this.stick = noop;
    }
}

class Config {
    /**
     * 最后停留的目标模式，类似于 animation-fill-mode，默认值 forwards。
     */
    fillMode = "backwards" /* PLAYER_FILL_MODE.BACKWARDS */;
    /**
     * 播放模式，默认值 forwards
     */
    playMode = "forwards" /* PLAYER_PLAY_MODE.FORWARDS */;
    /**
     * 填充模式，类似于 content-mode。
     */
    contentMode = "fill" /* PLAYER_CONTENT_MODE.FILL */;
    /**
     * 开始播放的帧，默认值 0
     */
    startFrame = 0;
    /**
     * 结束播放的帧，默认值 0
     */
    endFrame = 0;
    /**
     * 循环播放的开始帧，默认值 0
     */
    loopStartFrame = 0;
    /**
     * 循环次数，默认值 0（无限循环）
     */
    loop = 0;
    register(config) {
        if (typeof config.loop === "number" && config.loop >= 0) {
            this.loop = config.loop;
        }
        if (config.fillMode &&
            [
                "forwards" /* PLAYER_FILL_MODE.FORWARDS */,
                "backwards" /* PLAYER_FILL_MODE.BACKWARDS */,
                "none" /* PLAYER_FILL_MODE.NONE */,
            ].includes(config.fillMode)) {
            this.fillMode = config.fillMode;
        }
        if (config.playMode &&
            ["forwards" /* PLAYER_PLAY_MODE.FORWARDS */, "fallbacks" /* PLAYER_PLAY_MODE.FALLBACKS */].includes(config.playMode)) {
            this.playMode = config.playMode;
        }
        if (typeof config.startFrame === "number" && config.startFrame >= 0) {
            this.startFrame = config.startFrame;
        }
        if (typeof config.endFrame === "number" && config.endFrame >= 0) {
            this.endFrame = config.endFrame;
        }
        if (typeof config.loopStartFrame === "number" &&
            config.loopStartFrame >= 0) {
            this.loopStartFrame = config.loopStartFrame;
        }
        if (typeof config.contentMode === "string") {
            this.contentMode = config.contentMode;
        }
    }
    setItem(key, value) {
        this.register({ [key]: value });
    }
    getConfig(entity) {
        const { playMode, loopStartFrame, startFrame, endFrame, fillMode, loop } = this;
        const { fps, sprites } = entity;
        let { frames } = entity;
        const spriteCount = sprites.length;
        const start = startFrame > 0 ? startFrame : 0;
        const end = endFrame > 0 && endFrame < frames ? endFrame : frames;
        // 每帧持续的时间
        const frameDuration = 1000 / fps;
        if (start > end) {
            throw new Error("StartFrame should greater than EndFrame");
        }
        // 更新活动帧总数
        if (end < frames) {
            frames = end - start;
        }
        else if (start > 0) {
            frames -= start;
        }
        const duration = Math.floor(frames * frameDuration * 10 ** 6) / 10 ** 6;
        let currFrame = 0;
        let extFrame = 0;
        let loopStart;
        // 顺序播放/倒叙播放
        if (playMode === "forwards" /* PLAYER_PLAY_MODE.FORWARDS */) {
            // 重置为开始帧
            currFrame = Math.max(loopStartFrame, startFrame);
            if (fillMode === "forwards" /* PLAYER_FILL_MODE.FORWARDS */) {
                extFrame = 1;
            }
            loopStart =
                loopStartFrame > start ? (loopStartFrame - start) * frameDuration : 0;
        }
        else {
            // 重置为开始帧
            currFrame = Math.min(loopStartFrame, end - 1);
            if (fillMode === "backwards" /* PLAYER_FILL_MODE.BACKWARDS */) {
                extFrame = 1;
            }
            loopStart =
                loopStartFrame < end ? (end - loopStartFrame) * frameDuration : 0;
        }
        return {
            currFrame,
            startFrame: start,
            endFrame: end,
            totalFrame: frames,
            spriteCount,
            aniConfig: {
                // 单个周期的运行时长
                duration,
                // 第一个周期开始时间偏移量
                loopStart,
                // 循环次数
                loop: loop === 0 ? Infinity : loop,
                // 最后一帧不在周期内，需要单独计算
                fillValue: extFrame * frameDuration,
            },
        };
    }
}

/**
 * SVGA 播放器
 */
class Player {
    /**
     * SVGA 元数据
     * Video Entity
     */
    entity;
    /**
     * 当前配置项
     */
    config = new Config();
    /**
     * 资源管理器
     */
    resource = null;
    /**
     * 刷头实例
     */
    painter = new Painter();
    /**
     * 动画实例
     */
    animator = new Animator();
    /**
     * 渲染器实例
     */
    renderer = null;
    /**
     * 设置配置项
     * @param options 可配置项
     * @property container 主屏，播放动画的 Canvas 元素
     * @property secondary 副屏，播放动画的 Canvas 元素
     * @property loop 循环次数，默认值 0（无限循环）
     * @property fillMode 最后停留的目标模式，类似于 animation-fill-mode，接受值 forwards 和 fallbacks，默认值 forwards。
     * @property playMode 播放模式，接受值 forwards 和 fallbacks ，默认值 forwards。
     * @property startFrame 单个循环周期内开始播放的帧数，默认值 0
     * @property endFrame 单个循环周期内结束播放的帧数，默认值 0
     * @property loopStartFrame 循环播放的开始帧，仅影响第一个周期的开始帧，默认值 0
     * @property enableInObserver 是否启用 IntersectionObserver 监听容器是否处于浏览器视窗内，默认值 false
     */
    async setConfig(options, component) {
        const config = typeof options === "string" ? { container: options } : options;
        const { container, secondary } = config;
        this.config.register(config);
        // 监听容器是否处于浏览器视窗内
        // this.setIntersectionObserver()
        await this.painter.register(container, secondary, component);
        this.renderer = new Renderer2D(this.painter.BC);
        this.resource = new ResourceManager(this.painter);
        this.animator.onAnimate = platform.rAF.bind(null, this.painter.F);
    }
    /**
     * 更新配置
     * @param key
     * @param value
     */
    setItem(key, value) {
        this.config.setItem(key, value);
    }
    /**
     * 装载 SVGA 数据元
     * @param videoEntity SVGA 数据源
     * @returns Promise<void>
     */
    async mount(videoEntity) {
        if (!videoEntity)
            throw new Error("videoEntity undefined");
        const { images, filename } = videoEntity;
        this.animator.stop();
        this.painter.clearSecondary();
        this.resource.release();
        this.entity = videoEntity;
        await this.resource.loadImagesWithRecord(images, filename);
    }
    /**
     * 开始播放事件回调
     * @param frame
     */
    onStart;
    /**
     * 重新播放事件回调
     * @param frame
     */
    onResume;
    /**
     * 暂停播放事件回调
     * @param frame
     */
    onPause;
    /**
     * 停止播放事件回调
     * @param frame
     */
    onStop;
    /**
     * 播放中事件回调
     * @param percent
     * @param frame
     * @param frames
     */
    onProcess;
    /**
     * 结束播放事件回调
     * @param frame
     */
    onEnd;
    /**
     * 开始播放
     */
    start() {
        this.startAnimation();
        this.onStart?.();
    }
    /**
     * 重新播放
     */
    resume() {
        if (this.animator.resume()) {
            this.onResume?.();
        }
    }
    /**
     * 暂停播放
     */
    pause() {
        if (this.animator.pause()) {
            this.onPause?.();
        }
    }
    /**
     * 停止播放
     */
    stop() {
        this.animator.stop();
        this.painter.clearContainer();
        this.painter.clearSecondary();
        this.onStop?.();
    }
    /**
     * 销毁实例
     */
    destroy() {
        this.animator.stop();
        this.painter.destroy();
        this.renderer?.destroy();
        this.resource?.release();
        this.resource?.cleanup();
        this.entity = undefined;
    }
    /**
     * 跳转到指定帧
     * @param frame 目标帧
     * @param andPlay 是否立即播放
     */
    stepToFrame(frame, andPlay = false) {
        if (!this.entity || frame < 0 || frame >= this.entity.frames)
            return;
        this.pause();
        this.config.loopStartFrame = frame;
        if (andPlay) {
            this.start();
        }
    }
    /**
     * 跳转到指定百分比
     * @param percent 目标百分比
     * @param andPlay 是否立即播放
     */
    stepToPercentage(percent, andPlay = false) {
        if (!this.entity)
            return;
        const { frames } = this.entity;
        let frame = percent < 0 ? 0 : Math.round(percent * frames);
        if (frame >= frames) {
            frame = frames - 1;
        }
        debugger;
        this.stepToFrame(frame, andPlay);
    }
    /**
     * 开始绘制动画
     */
    startAnimation() {
        const { entity, config, animator, painter, renderer, resource } = this;
        const { W, H } = painter;
        const { fillMode, playMode, contentMode } = config;
        const { currFrame, startFrame, endFrame, totalFrame, spriteCount, aniConfig, } = config.getConfig(entity);
        const { duration, loopStart, loop, fillValue } = aniConfig;
        const isReverseMode = playMode === "fallbacks" /* PLAYER_PLAY_MODE.FALLBACKS */;
        // 当前帧
        let currentFrame = currFrame;
        // 片段绘制结束位置
        let tail = 0;
        let nextTail;
        // 上一帧
        let latestFrame;
        // 下一帧
        let nextFrame;
        // 精确帧
        let exactFrame;
        // 当前已完成的百分比
        let percent;
        // 是否还有剩余时间
        let hasRemained;
        // 更新动画基础信息
        animator.setConfig(duration, loopStart, loop, fillValue);
        renderer.resize(contentMode, entity.size, { width: W, height: H });
        // 分段渲染函数
        const MAX_DRAW_TIME_PER_FRAME = 8;
        const MAX_ACCELERATE_DRAW_TIME_PER_FRAME = 3;
        const MAX_DYNAMIC_CHUNK_SIZE = 34;
        const MIN_DYNAMIC_CHUNK_SIZE = 1;
        // 动态调整每次绘制的块大小
        let dynamicChunkSize = 4; // 初始块大小
        let startTime;
        let chunk;
        let elapsed;
        // 使用`指数退避算法`平衡渲染速度和流畅度
        const patchDraw = (before) => {
            startTime = platform.now();
            before();
            while (tail < spriteCount) {
                // 根据当前块大小计算nextTail
                chunk = Math.min(dynamicChunkSize, spriteCount - tail);
                nextTail = (tail + chunk) | 0;
                renderer.render(entity, resource.materials, resource.dynamicMaterials, currentFrame, tail, nextTail);
                tail = nextTail;
                // 动态调整块大小
                elapsed = platform.now() - startTime;
                if (elapsed < MAX_ACCELERATE_DRAW_TIME_PER_FRAME) {
                    dynamicChunkSize = Math.min(dynamicChunkSize * 2, MAX_DYNAMIC_CHUNK_SIZE); // 加快绘制
                }
                else if (elapsed > MAX_DRAW_TIME_PER_FRAME) {
                    dynamicChunkSize = Math.max(dynamicChunkSize / 2, MIN_DYNAMIC_CHUNK_SIZE); // 减慢绘制
                    break;
                }
            }
        };
        // 动画绘制过程
        animator.onUpdate = (timePercent) => {
            patchDraw(() => {
                percent = isReverseMode ? 1 - timePercent : timePercent;
                exactFrame = percent * totalFrame;
                if (isReverseMode) {
                    nextFrame =
                        (timePercent === 0 ? endFrame : Math.ceil(exactFrame)) - 1;
                    // FIXME: 倒序会有一帧的偏差，需要校准当前帧
                    percent = currentFrame / totalFrame;
                }
                else {
                    nextFrame = timePercent === 1 ? startFrame : Math.floor(exactFrame);
                }
                hasRemained = currentFrame === nextFrame;
            });
            if (hasRemained)
                return;
            painter.clearContainer();
            painter.stick();
            painter.clearSecondary();
            latestFrame = currentFrame;
            currentFrame = nextFrame;
            tail = 0;
            this.onProcess?.(~~(percent * 100) / 100, latestFrame);
        };
        animator.onStart = () => {
            entity.locked = true;
        };
        animator.onEnd = () => {
            entity.locked = false;
            // 如果不保留最后一帧渲染，则清空画布
            if (fillMode === "none" /* PLAYER_FILL_MODE.NONE */) {
                painter.clearContainer();
            }
            this.onEnd?.();
        };
        animator.start();
    }
}

class Poster {
    /**
     * SVGA 元数据
     * Video Entity
     */
    entity;
    /**
     * 海报配置项
     */
    config = {
        /**
         * 主屏，绘制海报的 Canvas 元素
         */
        container: "",
        /**
         * 填充模式，类似于 content-mode。
         */
        contentMode: "fill" /* PLAYER_CONTENT_MODE.FILL */,
        /**
         * 绘制成海报的帧，默认是0。
         */
        frame: 0,
    };
    /**
     * 是否配置完成
     */
    isConfigured = false;
    /**
     * 刷头实例
     */
    painter;
    /**
     * 资源管理器
     */
    resource = null;
    /**
     * 渲染器实例
     */
    renderer = null;
    constructor(width, height) {
        this.painter = new Painter("poster", width, height);
    }
    /**
     * 注册 SVGA 海报
     * @param selector 容器选择器
     * @param component 组件
     */
    async register(selector = "", component) {
        await this.painter.register(selector, "", component);
        this.renderer = new Renderer2D(this.painter.BC);
        this.resource = new ResourceManager(this.painter);
    }
    /**
     * 设置配置项
     * @param options 可配置项
     */
    async setConfig(options = {}, component) {
        if (typeof options === "string") {
            this.config.container = options;
        }
        else {
            Object.assign(this.config, options);
        }
        this.isConfigured = true;
        await this.register(this.config.container, component);
    }
    /**
     * 修改内容模式
     * @param contentMode
     */
    setContentMode(contentMode) {
        this.config.contentMode = contentMode;
    }
    /**
     * 设置当前帧
     * @param frame
     */
    setFrame(frame) {
        this.config.frame = frame;
    }
    /**
     * 装载 SVGA 数据元
     * @param videoEntity SVGA 数据源
     * @param currFrame
     * @returns
     */
    async mount(videoEntity) {
        if (!videoEntity) {
            throw new Error("videoEntity undefined");
        }
        if (!this.isConfigured) {
            await this.register();
            this.isConfigured = true;
        }
        const { images, filename } = videoEntity;
        this.painter.clearContainer();
        this.resource.release();
        this.entity = videoEntity;
        await this.resource.loadImagesWithRecord(images, filename);
    }
    /**
     * 绘制海报
     */
    draw() {
        if (!this.entity)
            return;
        const { painter, renderer, resource, entity, config } = this;
        renderer.resize(config.contentMode, entity.size, painter.F);
        renderer.render(entity, resource.materials, resource.dynamicMaterials, config.frame, 0, entity.sprites.length);
    }
    /**
     * 获取海报的 ImageData 数据
     */
    toImageData() {
        const { FC, W: width, H: height } = this.painter;
        return FC.getImageData(0, 0, width, height);
    }
    /**
     * 销毁海报
     */
    destroy() {
        this.painter.destroy();
        this.renderer?.destroy();
        this.resource?.release();
        this.resource?.cleanup();
        this.entity = undefined;
    }
}

function parseOptions(options) {
    const typeNumber = options.typeNumber ?? 4;
    const correctLevel = options.correctLevel ?? "H";
    const codeColor = options.codeColor ?? "#000000";
    const backgroundColor = options.backgroundColor ?? "#FFFFFF";
    return {
        code: options.code,
        size: options.size,
        typeNumber,
        correctLevel,
        codeColor,
        backgroundColor,
    };
}
const calcCellSizeAndPadding = (moduleCount, size) => {
    const cellSize = ~~(size / moduleCount);
    return {
        padding: ~~((size - moduleCount * cellSize) / 2),
        cellSize: cellSize || 2,
    };
};
function generateImageBufferFromCode(options) {
    const { code, typeNumber, correctLevel, size, codeColor, backgroundColor } = parseOptions(options);
    let qr;
    try {
        qr = new QRCode(typeNumber, correctLevel);
        qr.addData(code);
        qr.make();
    }
    catch (e) {
        if (typeNumber >= 40) {
            throw new Error("Text too long to encode");
        }
        return arguments.callee({
            code,
            size,
            correctLevel,
            typeNumber: typeNumber + 1,
            codeColor,
            backgroundColor,
        });
    }
    // calc cellsize and margin
    const moduleCount = qr.getModuleCount();
    const { padding, cellSize } = calcCellSizeAndPadding(moduleCount, size);
    const max = moduleCount * cellSize + padding;
    const CODE_COLOR = +`${codeColor.replace("#", "0x")}FF`;
    const BACKGROUND_COLOR = +`${backgroundColor.replace("#", "0x")}FF`;
    const png = new PNGEncoder(size, size);
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (padding <= x && x < max && padding <= y && y < max) {
                const c = ~~((x - padding) / cellSize);
                const r = ~~((y - padding) / cellSize);
                png.setPixel(x, y, qr.isDark(r, c) ? CODE_COLOR : BACKGROUND_COLOR);
            }
            else {
                png.setPixel(x, y, BACKGROUND_COLOR);
            }
        }
    }
    return png.flush();
}
function generateImageFromCode(options) {
    const buff = generateImageBufferFromCode(options);
    return platform.decode.toDataURL(buff);
}

function createBufferOfImageData(imageData) {
    const { width, height, data } = imageData;
    return new PNGEncoder(width, height).write(data).flush();
}
/**
 * @deprecated 请使用 createBufferOfImageData 代替，此方法可能在后续版本中移除
 */
const getBufferFromImageData = createBufferOfImageData;
function createImageDataUrl(imageData) {
    const buff = createBufferOfImageData(imageData);
    return platform.decode.toDataURL(buff);
}
/**
 * @deprecated 请使用 createImageDataUrl 代替，此方法可能在后续版本中移除
 */
const getDataURLFromImageData = createImageDataUrl;

/**
 * 检查数据是否为zlib压缩格式
 * @param data 待检查的二进制数据
 * @returns 是否为zlib压缩格式
 */
function isZlibCompressed(data) {
    // 检查数据长度是否足够（至少需要2字节头部和4字节ADLER-32校验和）
    if (data.length < 6) {
        return false;
    }
    // 获取CMF和FLG字节
    const cmf = data[0];
    const flg = data[1];
    // 检查CMF的压缩方法（低4位为8表示DEFLATE）
    // eslint-disable-next-line no-bitwise
    if ((cmf & 0x0F) !== 8) {
        return false;
    }
    // 检查窗口大小（高4位通常为7，但不是严格要求）
    // 这里不强制检查，因为理论上可以是其他值
    // 验证头部校验（CMF * 256 + FLG必须是31的倍数）
    if (((cmf * 256 + flg) % 31) !== 0) {
        return false;
    }
    // 检查字典标志位（如果设置了字典，需要额外验证，但这种情况很少见）
    // eslint-disable-next-line no-bitwise
    const fdict = (flg & 0x20) !== 0;
    if (fdict) {
        // 标准zlib压缩通常不使用预定义字典
        // 这里假设不使用字典，若检测到字典标志则认为不是标准zlib格式
        return false;
    }
    // 尝试提取ADLER-32校验和并验证其格式
    // 虽然无法验证校验和值（需要解压后计算），但可以检查其是否为合理的数值
    const adler32Bytes = data.slice(-4);
    if (adler32Bytes.length !== 4) {
        return false;
    }
    // eslint-disable-next-line no-bitwise
    const adler32 = (adler32Bytes[0] << 24) | (adler32Bytes[1] << 16) | (adler32Bytes[2] << 8) | adler32Bytes[3];
    // 有效的ADLER-32值应大于0（除非是空数据）
    if (data.length > 2 && adler32 === 0) {
        return false;
    }
    // 所有检查都通过，数据可能是zlib压缩格式
    return true;
}

class VideoManager {
    /**
     * 视频池的当前指针位置
     */
    point = 0;
    /**
     * 视频的最大留存数量，其他视频将放在磁盘上缓存
     */
    maxRemain = 3;
    /**
     * 留存视频的开始指针位置
     */
    remainStart = 0;
    /**
     * 留存视频的结束指针位置
     */
    remainEnd = 0;
    /**
     * 视频加载模式
     * - 快速加载模式：可保证当前视频加载完成后，尽快播放；其他请求将使用Promise的方式保存在bucket中，以供后续使用
     * - 完整加载模式：可保证所有视频加载完成，确保播放切换的流畅性
     */
    loadMode = "fast";
    /**
     * 视频池的所有数据
     */
    buckets = [];
    options = {
        /**
         * 预处理动效数据
         * @param url
         * @returns
         */
        preprocess: (bucket) => Parser.download(bucket.origin),
        /**
         * 后处理动效数据
         * @param bucket
         * @param data
         * @returns
         */
        postprocess: (bucket, data) => Parser.parseVideo(data, bucket.origin, true),
        /**
         * 清理数据
         * @param buckets
         * @returns
         */
        cleanup: (buckets) => {
            const { globals, local, path } = platform;
            buckets.forEach((bucket) => {
                if (path.is(bucket.local)) {
                    local.remove(bucket.local);
                }
            });
        },
    };
    /**
     * 获取视频池大小
     */
    get size() {
        return this.buckets.length;
    }
    constructor(loadMode, options) {
        if (typeof loadMode === "string") {
            this.loadMode = loadMode;
        }
        Object.assign(this.options, options);
    }
    /**
     * 更新留存指针位置
     */
    updateRemainRange(point, maxRemain, totalCount) {
        if (point < 0) {
            this.point = 0;
        }
        else if (point >= totalCount) {
            this.point = totalCount - 1;
        }
        else {
            this.point = point;
        }
        if (this.loadMode === "whole") {
            this.remainStart = 0;
            this.remainEnd = totalCount;
        }
        else {
            if (maxRemain < 1) {
                this.maxRemain = 1;
            }
            else if (maxRemain > totalCount) {
                this.maxRemain = totalCount;
            }
            else {
                this.maxRemain = maxRemain;
            }
            this.remainStart = this.point - Math.floor(this.maxRemain / 2);
            if (this.remainStart < 0) {
                this.remainStart = totalCount + this.remainStart;
            }
            this.remainEnd = this.remainStart + this.maxRemain;
            if (this.remainEnd > totalCount) {
                this.remainEnd = this.remainEnd % totalCount;
            }
        }
    }
    /**
     * 指针是否在留存空间内
     * @param point
     * @returns
     */
    includeRemainRange(point) {
        if (this.remainStart < this.remainEnd) {
            return point >= this.remainStart && point < this.remainEnd;
        }
        if (this.remainStart > this.remainEnd) {
            return point >= this.remainStart || point < this.remainEnd;
        }
        return true;
    }
    async downloadAndParseVideo(bucket, needParse = false) {
        const { options } = this;
        const data = await options.preprocess(bucket);
        if (needParse) {
            return options.postprocess(bucket, data);
        }
        return data;
    }
    /**
     * 创建bucket
     * @param url 远程地址
     * @param point 指针位置
     * @param needDownloadAndParse 是否需要下载并解析
     * @returns
     */
    async createBucket(url, point, needDownloadAndParse) {
        const { path } = platform;
        const bucket = {
            origin: url,
            local: path.resolve(path.filename(url)),
            entity: null,
            promise: null,
        };
        this.buckets[point] = bucket;
        if (needDownloadAndParse) {
            bucket.entity = await this.downloadAndParseVideo(bucket, true);
        }
        else if (this.includeRemainRange(point)) {
            bucket.promise = this.downloadAndParseVideo(bucket);
        }
        return bucket;
    }
    /**
     * 预加载视频到本地磁盘中
     * @param urls 视频远程地址
     * @param point 当前指针位置
     * @param maxRemain 最大留存数量
     */
    async prepare(urls, point = 0, maxRemain = 3) {
        this.updateRemainRange(point, maxRemain, urls.length);
        const { loadMode, point: currentPoint } = this;
        // 优先加载当前动效
        const preloadBucket = await this.createBucket(urls[currentPoint], currentPoint, true);
        await Promise.all(urls.map((url, index) => {
            // 当前帧的视频已经预加载到内存中
            if (index === currentPoint) {
                return preloadBucket;
            }
            return this.createBucket(url, index, loadMode === "whole");
        }));
    }
    /**
     * 获取当前帧的bucket
     * @returns
     */
    async get() {
        const bucket = this.buckets[this.point];
        if (bucket.promise) {
            bucket.entity = await bucket.promise.then((data) => this.options.postprocess(bucket, data));
            bucket.promise = null;
        }
        else if (!bucket.entity) {
            bucket.entity = await this.downloadAndParseVideo(bucket, true);
        }
        return bucket;
    }
    /**
     * 获取当前的指针位置
     * @returns
     */
    getPoint() {
        return this.point;
    }
    /**
     * 获取指定位置的bucket
     * @param pos
     * @returns
     */
    async go(point) {
        const { size, buckets, loadMode } = this;
        if (point < 0 || point >= size) {
            return buckets[this.point];
        }
        this.updateRemainRange(point, this.maxRemain, buckets.length);
        if (loadMode === "fast" && this.maxRemain !== buckets.length) {
            buckets.forEach((bucket, index) => {
                if (this.includeRemainRange(index)) {
                    if (bucket.entity === null && bucket.promise === null) {
                        bucket.promise = this.downloadAndParseVideo(bucket);
                    }
                }
                else {
                    bucket.entity = null;
                    bucket.promise = null;
                }
            });
        }
        return this.get();
    }
    /**
     * 清理所有的bucket
     * @returns
     */
    async clear(needRemoveFiles = true) {
        const { buckets } = this;
        this.point = 0;
        this.remainStart = 0;
        this.remainEnd = 0;
        this.maxRemain = 3;
        this.buckets = [];
        if (needRemoveFiles) {
            await this.options.cleanup(buckets);
        }
    }
}

class VideoEditor {
    painter;
    resource;
    entity;
    constructor(painter, resource, entity) {
        this.painter = painter;
        this.resource = resource;
        this.entity = entity;
    }
    async set(key, value, mode = "R") {
        const { entity, resource } = this;
        if (mode === "A") {
            await resource.loadImagesWithRecord({ [key]: value }, entity.filename, "dynamic");
        }
        else {
            entity.images[key] = value;
        }
    }
    /**
     * 获取自定义编辑器
     * @returns
     */
    getContext() {
        return this.painter.BC;
    }
    /**
     * 是否是有效的Key
     * @param key
     * @returns
     */
    hasValidKey(key) {
        const { images } = this.entity;
        if (typeof Object.hasOwn === "function") {
            return Object.hasOwn(images, key);
        }
        return Object.prototype.hasOwnProperty.call(images, key);
    }
    /**
     * 加载并缓存图片
     * @param source
     * @param url
     * @returns
     */
    loadImage(source, url) {
        return this.resource.loadExtImage(source, platform.path.filename(url));
    }
    /**
     * 创建画布图片
     * @param key
     * @param context
     * @param options
     * @returns
     */
    async setCanvas(key, context, options) {
        if (this.entity.locked)
            return;
        const { canvas } = context;
        const width = options?.width ?? canvas.width;
        const height = options?.height ?? canvas.height;
        const imageData = context.getImageData(0, 0, width, height);
        await this.set(key, new Uint8Array(createBufferOfImageData(imageData)), options?.mode);
    }
    /**
     * 创建二进制图片
     * @param key
     * @param buff
     * @param options
     * @returns
     */
    async setImage(key, url, options) {
        if (this.entity.locked)
            return;
        if (url.startsWith("data:image")) {
            await this.set(key, url, options?.mode);
        }
        else {
            await this.set(key, new Uint8Array(await Parser.download(url)), options?.mode);
        }
    }
    /**
     * 创建二维码图片
     * @param key
     * @param code
     * @param options
     * @returns
     */
    async setQRCode(key, code, options) {
        if (this.entity.locked)
            return;
        await this.set(key, new Uint8Array(generateImageBufferFromCode({ ...options, code })), options?.mode);
    }
}

export { Painter, Parser, Player, Poster, VideoEditor, VideoManager, createBufferOfImageData, createImageDataUrl, generateImageBufferFromCode, generateImageFromCode, getBufferFromImageData, getDataURLFromImageData, isZlibCompressed, platform };
//# sourceMappingURL=index.js.map
