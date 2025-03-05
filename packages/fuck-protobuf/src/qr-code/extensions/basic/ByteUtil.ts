export const ByteUtil = {
  toInt8(num: number) {
    const arr = new ArrayBuffer(1);
    const view = new DataView(arr);

    view.setUint8(0, num);

    return arr;
  },
  toInt32(num: number) {
    const arr = new ArrayBuffer(4);
    const view = new DataView(arr);

    view.setUint32(0, num, false);

    return arr;
  },
};
