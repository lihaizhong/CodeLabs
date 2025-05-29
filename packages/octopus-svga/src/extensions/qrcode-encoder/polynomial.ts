// ---------------------------------------------------------------------
// Polynomial
// ---------------------------------------------------------------------

import { QRMath } from "./math";

export class Polynomial {
  private readonly num: number[];

  constructor(num: number[], shift: number) {
    const { length } = num;

    if (typeof length === 'undefined') {
      throw new Error(`${length}/${shift}`);
    }

    let offset = 0;
    while (offset < length && num[offset] === 0) {
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

  public getAt(i: number): number {
    return this.num[i];
  }

  public multiply(e: Polynomial): Polynomial {
    const { glog, gexp } = QRMath;
    const num: number[] = [];

    for (let i = 0; i < this.length; i++) {
      for (let j = 0; j < e.length; j++) {
        num[i + j] ^= gexp(glog(this.getAt(i)) + glog(e.getAt(j)));
      }
    }

    return new Polynomial(num, 0);
  }

  public mod(e: Polynomial): Polynomial {
    if (this.length - e.length < 0) {
      return this;
    }

    const { glog, gexp } = QRMath;
    const ratio = glog(this.getAt(0)) - glog(e.getAt(0));
    const num: number[] = [];

    for (var i = 0; i < this.length; i++) {
      const n = this.getAt(i);

      num[i] = i < e.length ? n ^ gexp(glog(e.getAt(i)) + ratio) : n;
    }

    // recursive call
    return new Polynomial(num, 0).mod(e);
  }
}
