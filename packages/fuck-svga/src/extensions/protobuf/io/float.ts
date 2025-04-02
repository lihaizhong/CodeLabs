const view = new DataView(new ArrayBuffer(4));

export default {
  readFloatLE(buf: Uint8Array, pos: number): number {
    new Uint8Array(view.buffer).set(buf.subarray(pos, pos + 4));

    return view.getFloat32(0, true);
  },
};
