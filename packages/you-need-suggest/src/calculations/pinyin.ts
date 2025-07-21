import { defineAdaptor } from "../defineAdaptor";

/**
 * https://github.com/sxei/pinyinjs
 * https://www.cnblogs.com/guohu/p/5021336.html
 * 
 * - [打造最好的Java拼音库TinyPinyin（一）：单字符转拼音的极致优化](https://github.com/promeG/promeg.github.io/blob/master/_posts/2017-03-19-tinypinyin-part-1.markdown)
 * - [打造最好的Java拼音库TinyPinyin（二）：多音字快速处理方案](https://github.com/promeG/promeg.github.io/blob/master/_posts/2017-03-20-tinypinyin-part-2.markdown)
 * - [打造最好的Java拼音库TinyPinyin（三）：API设计和测试实践](https://github.com/promeG/promeg.github.io/blob/master/_posts/2017-03-22-tinypinyin-part-3.markdown)
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
