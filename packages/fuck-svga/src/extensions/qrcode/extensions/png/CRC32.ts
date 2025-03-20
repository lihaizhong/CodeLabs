export class CRC32 {
  static table: Record<string, number[]> | null = null;

  constructor(private readonly buf: number[]) {
    if (CRC32.table == null) {
      const T0 = this.signedCRCTable();
      const TT = this.sliceBy16Tables(T0);

      CRC32.table = {
        T0,
        T1: TT[0],
        T2: TT[1],
        T3: TT[2],
        T4: TT[3],
        T5: TT[4],
        T6: TT[5],
        T7: TT[6],
        T8: TT[7],
        T9: TT[8],
        Ta: TT[9],
        Tb: TT[10],
        Tc: TT[11],
        Td: TT[12],
        Te: TT[13],
        Tf: TT[14],
      };
    }
  }

  private signedCRCTable() {
    let c = 0;
    let table = new Array(256);

    for (let n = 0; n < 256; n++) {
      c = n;
      for (let i = 0; i < 8; i++) {
        c = c & 1 ? -306674912 ^ (c >>> 1) : c >>> 1;
      }
      table[n] = c;
    }

    return table;
  }

  private sliceBy16Tables(T: number[]) {
    let c = 0;
    let v = 0;
    let n = 0;
    const table = new Array(4096);

    for (n = 0; n < 256; n++) {
      table[n] = T[n];
    }

    for (n = 0; n < 256; n++) {
      v = T[n];
      for (c = 256 + n; c < 4096; c += 256) {
        v = table[c] = (v >>> 8) ^ T[v & 0xff];
      }
    }

    const out = [];
    for (n = 1; n < 16; n++) {
      out[n - 1] = table.slice(n * 256, n * 256 + 256);
    }
    return out;
  }

  public read(): number {
    const { buf: B } = this;
    const { T0, T1, T2, T3, T4, T5, T6, T7, T8, T9, Ta, Tb, Tc, Td, Te, Tf } =
      CRC32.table!;
    let C = -1;
    let L = B.length - 15;
    let i = 0;

    while (i < L) {
      C =
        Tf[B[i++] ^ (C & 255)] ^
        Te[B[i++] ^ ((C >> 8) & 255)] ^
        Td[B[i++] ^ ((C >> 16) & 255)] ^
        Tc[B[i++] ^ (C >>> 24)] ^
        Tb[B[i++]] ^
        Ta[B[i++]] ^
        T9[B[i++]] ^
        T8[B[i++]] ^
        T7[B[i++]] ^
        T6[B[i++]] ^
        T5[B[i++]] ^
        T4[B[i++]] ^
        T3[B[i++]] ^
        T2[B[i++]] ^
        T1[B[i++]] ^
        T0[B[i++]];
    }

    L += 15;
    while (i < L) {
      C = (C >>> 8) ^ T0[(C ^ B[i++]) & 0xff];
    }

    return ~C;
  }
}
