// ---------------------------------------------------------------------
// base64EncodeOutputStream
// ---------------------------------------------------------------------

export class Base64EncodeOutputStream {
  private buffer = 0;

  private buflen = 0;

  private length = 0;

  private base64 = '';

  private encode(n: number): number {
    if (n < 26) {
      return 0x41 + n;
    }
    
    if (n < 52) {
      return 0x61 + (n - 26);
    }
    
    if (n < 62) {
      return 0x30 + (n - 52);
    }
    
    if (n == 62) {
      return 0x2b;
    }
    
    if (n == 63) {
      return 0x2f;
    }

    throw new Error(`n: ${n}`);
  }

  private writeEncoded(b: number): void {
    this.base64 += String.fromCharCode(this.encode(b & 0x3f));
  }

  public writeByte(n: number): void {
    this.buffer = (this.buffer << 8) | (n & 0xff);
    this.buflen += 8;
    this.length += 1;

    while (this.buflen >= 6) {
      this.writeEncoded(this.buffer >>> (this.buflen - 6));
      this.buflen -= 6;
    }
  }

  public flush(): void {
    if (this.buflen > 0) {
      this.writeEncoded(this.buflen << (6 - this.buflen));
      this.buffer = 0;
      this.buflen = 0;
    }

    if (this.length % 3 != 0) {
      // padding
      const padlen = 3 - (this.length % 3)

      for (let i = 0; i < padlen; i++) {
        this.base64 += '='
      }
    }
  }

  public toString() {
    return this.base64;
  }
}
