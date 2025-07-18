# you need suggest

这是一个本地搜索建议的插件。对于数据量只有固定的几百条数据，不适合后端实现模糊搜索的情况。例如下面的场景：

![模糊搜索](/public/source/WX20191121-020346.png)

这里配置了用于匹配的字段 *（字符串类型的任意字段）*。底层通过 **编辑距离算法**，计算出相似值，并根据相似度大小顺序返回结果。可以设置 **相似度阔值**，以减少不必要的返回数据量；可以设置 **大小写区分（仅支持英文）**。

## 安装

```bash
npm install you-need-suggest -S
```

## 使用

### 基本使用

```ts
import { YouNeedSuggestion } from "you-need-suggest";

const data = [
  {
    text: "test1"
  },
  {
    text: "test2"
  },
  {
    text: "test3"
  }
];
const suggestion = new YouNeedSuggestion(data);
const result = suggestion.get("t2");

// search value: [
//   { data: { text: 'test2' }, similarity: 0.5 },
//   { data: { text: 'test1' }, similarity: 0.25 },
//   { data: { text: 'test3' }, similarity: 0.25 }
// ]
console.log('search value: ', result);
```

### 自定义

```ts
const data = [
  {
    value: "test1"
  },
  {
    value: "test2"
  },
  {
    value: "test3"
  }
];
const suggestion = new YouNeedSuggestion(data, {
  keyNameList: ["value"],
  minSimilarity: 0.3
});
const result = suggestion.get("t2");

// search value: [
//   { data: { text: 'test2' }, similarity: 0.5 },
// ]
console.log('search value: ', result);
```

## 配置项

```ts
export interface YouNeedSuggestionOptions {
  // 进行匹配的字段，默认：["text"]
  keyNameList: string | string[];
  // 是否过滤空值，默认：true
  filterEmptyValue: boolean;
  // 是否区分大小写，默认：false
  caseSensitive: boolean;
  // 最小相似度，默认：0
  minSimilarity: number;
  // 计算算法适配器，默认使用编辑距离算法
  compare: (sourceStr: string, targetStr: string) => number;
}
```


