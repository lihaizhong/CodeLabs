import { ByteArrayOutputStream } from "./ByteArrayOutputStream";

export class BitOutputStream {
  private bit = 0;

  private bitlen = 0;

  constructor(private readonly out: ByteArrayOutputStream) {}

  write(data: number, length: number): void {
    if (data >>> length != 0) {
      throw new Error('length over');
    }

    while (this.bitlen + length >= 8) {
      this.out.writeByte(0xff & ((data << this.bitlen) | this.bit));
      length -= 8 - this.bitlen;
      data >>>= 8 - this.bitlen;
      this.bit = this.bitlen = 0;
    }

    this.bit = (data << this.bitlen) | this.bit;
    this.bitlen += length;
  }

  flush(): void {
    if (this.bitlen > 0) {
      this.out.writeByte(this.bit);
    }
  }
}