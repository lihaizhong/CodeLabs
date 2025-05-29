// 使用静态DataView池
const DATA_VIEW_POOL_SIZE = 4;
const dataViewPool: DataView[] = Array(DATA_VIEW_POOL_SIZE)
  .fill(0)
  .map(() => new DataView(new ArrayBuffer(8))); // 使用8字节支持double
let currentViewIndex = 0;

export default {
  readFloatLE(buf: Uint8Array, pos: number): number {
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
  },
};
