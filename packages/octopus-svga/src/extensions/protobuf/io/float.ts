const view = new DataView(new ArrayBuffer(4));
const tempUint8Array = new Uint8Array(view.buffer);

export default {
  readFloatLE(buf: Uint8Array, pos: number): number {
    if (pos < 0 || pos + 4 > buf.length) throw new RangeError("Index out of range");

    tempUint8Array.set(buf.subarray(pos, pos + 4));

    return view.getFloat32(0, true);
  },
};
