export declare class Polynomial {
    private readonly num;
    constructor(num: number[], shift: number);
    get length(): number;
    getAt(index: number): number;
    multiply(e: Polynomial): Polynomial;
    mod(e: Polynomial): Polynomial;
}
