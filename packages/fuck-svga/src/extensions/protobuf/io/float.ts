const dv = new DataView(new ArrayBuffer(4));

export default {
  readFloatLE(buf: Uint8Array, pos: number): number {
    new Uint8Array(dv.buffer).set(buf.subarray(pos, pos + 4));

    return dv.getFloat32(0, true);
  },
};
