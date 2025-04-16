export default {
  /**
   * 从 Uint8Array 中读取一个 64 位有符号整数（小端序）并返回 BigInt
   */
  readLongLEAsBigInt(buf: Uint8Array, pos: number): bigint {
    if (pos < 0 || pos + 8 > buf.length) throw new RangeError("Index out of range");

    const view = new DataView(new ArrayBuffer(8));
    const tempUint8Array = new Uint8Array(view.buffer);
    tempUint8Array.set(buf.subarray(pos, pos + 8));

    return view.getBigInt64(0, true);
  },

  /**
   * 从 Uint8Array 中读取一个 64 位无符号整数（小端序）并返回 BigInt
   */
  readULongLEAsBigInt(buf: Uint8Array, pos: number): bigint {
    if (pos < 0 || pos + 8 > buf.length) throw new RangeError("Index out of range");

    const view = new DataView(new ArrayBuffer(8));
    const tempUint8Array = new Uint8Array(view.buffer);
    tempUint8Array.set(buf.subarray(pos, pos + 8));

    return view.getBigUint64(0, true);
  },

  /**
   * 将一个 BigInt 写入 Uint8Array 作为 64 位有符号整数（小端序）
   */
  writeLongLEFromBigInt(value: bigint, buf: Uint8Array, pos: number): void {
    if (pos < 0 || pos + 8 > buf.length) throw new RangeError("Index out of range");

    const view = new DataView(new ArrayBuffer(8));
    view.setBigInt64(0, value, true);
    
    const tempUint8Array = new Uint8Array(view.buffer);
    buf.set(tempUint8Array, pos);
  },

  /**
   * 将一个 BigInt 写入 Uint8Array 作为 64 位无符号整数（小端序）
   */
  writeULongLEFromBigInt(value: bigint, buf: Uint8Array, pos: number): void {
    if (pos < 0 || pos + 8 > buf.length) throw new RangeError("Index out of range");

    const view = new DataView(new ArrayBuffer(8));
    view.setBigUint64(0, value, true);
    
    const tempUint8Array = new Uint8Array(view.buffer);
    buf.set(tempUint8Array, pos);
  },

  // 大端序方法
  readLongBEAsBigInt(buf: Uint8Array, pos: number): bigint {
    if (pos < 0 || pos + 8 > buf.length) throw new RangeError("Index out of range");

    const view = new DataView(new ArrayBuffer(8));
    const tempUint8Array = new Uint8Array(view.buffer);
    tempUint8Array.set(buf.subarray(pos, pos + 8));

    return view.getBigInt64(0, false);
  },

  readULongBEAsBigInt(buf: Uint8Array, pos: number): bigint {
    if (pos < 0 || pos + 8 > buf.length) throw new RangeError("Index out of range");

    const view = new DataView(new ArrayBuffer(8));
    const tempUint8Array = new Uint8Array(view.buffer);
    tempUint8Array.set(buf.subarray(pos, pos + 8));

    return view.getBigUint64(0, false);
  },

  writeLongBEFromBigInt(value: bigint, buf: Uint8Array, pos: number): void {
    if (pos < 0 || pos + 8 > buf.length) throw new RangeError("Index out of range");

    const view = new DataView(new ArrayBuffer(8));
    view.setBigInt64(0, value, false);
    
    const tempUint8Array = new Uint8Array(view.buffer);
    buf.set(tempUint8Array, pos);
  },

  writeULongBEFromBigInt(value: bigint, buf: Uint8Array, pos: number): void {
    if (pos < 0 || pos + 8 > buf.length) throw new RangeError("Index out of range");

    const view = new DataView(new ArrayBuffer(8));
    view.setBigUint64(0, value, false);
    
    const tempUint8Array = new Uint8Array(view.buffer);
    buf.set(tempUint8Array, pos);
  },
};
