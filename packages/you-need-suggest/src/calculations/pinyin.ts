import { defineAdaptor } from "../defineAdaptor";

/**
 * https://github.com/sxei/pinyinjs
 */
class PinYinCalculator {
  private options: any;

  constructor(options?: any) {
    Object.assign(this.options, options);
  }

  get(): number {
    return 0;
  }
}

export const calcAdaptor = defineAdaptor<any>((options?: any) => {
  const calculator = new PinYinCalculator(options);

  return (inputValue: string, comparedValue: string) => calculator.get();
});
