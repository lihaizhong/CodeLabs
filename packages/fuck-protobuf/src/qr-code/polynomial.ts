// ---------------------------------------------------------------------
// Polynomial
// ---------------------------------------------------------------------

import { QRMath } from "./math";

export class Polynomial {
  private readonly num: number[];

  constructor(num: number[], shift: number) {
    const { length } = num;

    if (typeof length == 'undefined') {
      throw new Error(`${length}/${shift}`);
    }

    let offset = 0;
    while (offset < length && num[offset] == 0) {
      offset++;
    }
    
    const len = length - offset;
    this.num = new Array(len + shift);
    for (let i = 0; i < len; i++) {
      this.num[i] = num[i + offset];
    }
  }

  public get length(): number {
    return this.num.length;
  }

  public getAt(index: number): number {
    return this.num[index];
  }

  public multiply(e: Polynomial): Polynomial {
    const num: number[] = [];

    for (let i = 0; i < this.length; i++) {
      for (let j = 0; j < e.length; j++) {
        num[i + j] ^= QRMath.gexp(QRMath.glog(this.getAt(i)) + QRMath.glog(e.getAt(j)));
      }
    }

    return new Polynomial(num, 0);
  }

  public mod(e: Polynomial): Polynomial {
    if (this.length - e.length < 0) {
      return this;
    }

    const ratio = QRMath.glog(this.getAt(0)) - QRMath.glog(e.getAt(0));
    const num: number[] = [];

    for (var i = 0; i < this.length; i++) {
      const n = this.getAt(i);

      num[i] = i < e.length ? n ^ QRMath.gexp(QRMath.glog(e.getAt(i)) + ratio) : n;
    }

    // for (var i = 0; i < this.length; i++) {
    //   num[i] = this.getAt(i);
    // }

    // for (var i = 0; i < e.length; i++) {
    //   num[i] ^= QRMath.gexp(QRMath.glog(e.getAt(i)) + ratio);
    // }

    // recursive call
    return new Polynomial(num, 0).mod(e);
  }
}
