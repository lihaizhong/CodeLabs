// ---------------------------------------------------------------------
// byteArrayOutputStream
// ---------------------------------------------------------------------

export class ByteArrayOutputStream {
  private bytes: number[] = [];

  public writeByte(byte: number): void {
    this.bytes.push(byte & 0xff);
  }

  public writeBytes(bytes: number[], offset?: number, length?: number): void {
    const off = offset || 0;
    const len = length || bytes.length;

    for (let i = 0; i < len; i++) {
      this.writeByte(bytes[i + off]);
    }
  }

  public writeShort(i: number): void {
    this.writeByte(i);
    this.writeByte(i >>> 8);
  }

  public writeString(s: string): void {
    for (let i = 0; i < s.length; i++) {
      this.writeByte(s.charCodeAt(i));
    }
  }

  public toByteArray(): number[] {
    return this.bytes;
  }

  public toString(): string {
    return `[${this.bytes.join(',')}]`;
  }
}
