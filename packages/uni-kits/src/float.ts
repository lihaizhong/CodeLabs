export default {
  readFloatLE(buf: Uint8Array, pos: number): number {
    if (pos < 0 || pos + 4 > buf.length) throw new RangeError("Index out of range");

    const view = new DataView(new ArrayBuffer(4));
    const tempUint8Array = new Uint8Array(view.buffer);
    tempUint8Array.set(buf.subarray(pos, pos + 4));

    return view.getFloat32(0, true);
  },

  writeFloatLE(value: number, buf: Uint8Array, pos: number): void {
    if (pos < 0 || pos + 4 > buf.length) throw new RangeError("Index out of range");

    const view = new DataView(new ArrayBuffer(4));
    view.setFloat32(0, value, true);
    
    const tempUint8Array = new Uint8Array(view.buffer);
    buf.set(tempUint8Array, pos);
  },

  // 大端序读取单精度浮点数
  readFloatBE(buf: Uint8Array, pos: number): number {
    if (pos < 0 || pos + 4 > buf.length) throw new RangeError("Index out of range");

    const view = new DataView(new ArrayBuffer(4));
    const tempUint8Array = new Uint8Array(view.buffer);
    tempUint8Array.set(buf.subarray(pos, pos + 4));

    return view.getFloat32(0, false);
  },

  // 大端序写入单精度浮点数
  writeFloatBE(value: number, buf: Uint8Array, pos: number): void {
    if (pos < 0 || pos + 4 > buf.length) throw new RangeError("Index out of range");

    const view = new DataView(new ArrayBuffer(4));
    view.setFloat32(0, value, false);
    
    const tempUint8Array = new Uint8Array(view.buffer);
    buf.set(tempUint8Array, pos);
  },

  // 小端序读取双精度浮点数
  readDoubleLE(buf: Uint8Array, pos: number): number {
    if (pos < 0 || pos + 8 > buf.length) throw new RangeError("Index out of range");

    const view = new DataView(new ArrayBuffer(8));
    const tempUint8Array = new Uint8Array(view.buffer);
    tempUint8Array.set(buf.subarray(pos, pos + 8));

    return view.getFloat64(0, true);
  },

  // 小端序写入双精度浮点数
  writeDoubleLE(value: number, buf: Uint8Array, pos: number): void {
    if (pos < 0 || pos + 8 > buf.length) throw new RangeError("Index out of range");

    const view = new DataView(new ArrayBuffer(8));
    view.setFloat64(0, value, true);
    
    const tempUint8Array = new Uint8Array(view.buffer);
    buf.set(tempUint8Array, pos);
  },

  // 大端序读取双精度浮点数
  readDoubleBE(buf: Uint8Array, pos: number): number {
    if (pos < 0 || pos + 8 > buf.length) throw new RangeError("Index out of range");

    const view = new DataView(new ArrayBuffer(8));
    const tempUint8Array = new Uint8Array(view.buffer);
    tempUint8Array.set(buf.subarray(pos, pos + 8));

    return view.getFloat64(0, false);
  },

  // 大端序写入双精度浮点数
  writeDoubleBE(value: number, buf: Uint8Array, pos: number): void {
    if (pos < 0 || pos + 8 > buf.length) throw new RangeError("Index out of range");

    const view = new DataView(new ArrayBuffer(8));
    view.setFloat64(0, value, false);
    
    const tempUint8Array = new Uint8Array(view.buffer);
    buf.set(tempUint8Array, pos);
  },
};
