import { calcAdaptor } from "./calculations/levenshtein-distance";

export interface YouNeedSuggestionOptions<K> {
  keyNameList: K[];
  filterEmptyValue: boolean;
  caseSensitive: boolean;
  minSimilarity: number;
  calc: (sourceStr: string, targetStr: string) => number;
}

export interface YouNeedSuggestResult<T> {
  data: T;
  similarity: number;
}

export class YouNeedSuggestion<T> {
  private dataSource: T[];

  private options: YouNeedSuggestionOptions<keyof T> = {
    // 进行匹配的字段
    keyNameList: [],
    // 是否过滤空值
    filterEmptyValue: true,
    // 是否区分大小写
    caseSensitive: false,
    // 最小相似度
    minSimilarity: 0,
    // 计算器
    calc: calcAdaptor(),
  };

  constructor(
    dataSource: T[],
    options: Partial<YouNeedSuggestionOptions<keyof T>>
  ) {
    Object.assign(this.options, options);
    this.dataSource = dataSource;
  }

  private parseValue(value: unknown): string {
    if (typeof value !== "string") {
      return "";
    }

    // 不区分大小写时，需要将字符串转换为小写
    return this.options.caseSensitive ? value : value.toLocaleLowerCase();
  }

  private getMaxSimilarity(value: string, match: T): number {
    const { filterEmptyValue, keyNameList, calc } = this.options;

    if ((filterEmptyValue && value === "") || typeof match !== "object" || match === null) {
      return Number.NEGATIVE_INFINITY;
    }

    if (typeof match === "string") {
      return calc(this.parseValue(match), value);
    }

    return keyNameList.reduce((lastSimilarity, key) => {
      const sourceStr: string = this.parseValue(match[key]);
      const currentSimilarity: number = calc(sourceStr, value);

      return Math.max(lastSimilarity, currentSimilarity);
    }, Number.NEGATIVE_INFINITY);
  }

  get(val: string): YouNeedSuggestResult<T>[] {
    const result: YouNeedSuggestResult<T>[] = [];
    const value = this.parseValue(val);

    for (let i = 0; i < this.dataSource.length; i++) {
      const match: T = this.dataSource[i];
      const similarity: number = this.getMaxSimilarity(value, match);

      if (similarity >= this.options.minSimilarity) {
        result.push({ data: match, similarity });
      }
    }

    return result.sort(
      (a: YouNeedSuggestResult<T>, b: YouNeedSuggestResult<T>) =>
        b.similarity - a.similarity
    );
  }
}
