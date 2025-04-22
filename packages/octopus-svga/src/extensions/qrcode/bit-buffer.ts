// ---------------------------------------------------------------------
// qrBitBuffer
// ---------------------------------------------------------------------

export class BitBuffer {
  public buffer: number[] = [];

  public lengthInBits = 0;

  public getAt(i: number): boolean {
    const bufIndex = ~~(i / 8);

    return ((this.buffer[bufIndex] >>> (7 - (i % 8))) & 1) == 1;
  }

  public put(num: number, length: number): void {
    for (let i = 0; i < length; i++) {
      this.putBit(((num >>> (length - i - 1)) & 1) == 1);
    }
  }

  public putBit(bit: boolean): void {
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
