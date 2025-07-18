interface YouNeedSuggestionOptions {
    keyNameList: string | string[];
    filterEmptyValue: boolean;
    caseSensitive: boolean;
    minSimilarity: number;
    compare: (sourceStr: string, targetStr: string) => number;
}
interface YouNeedSuggestResult<T> {
    data: T;
    similarity: number;
}
declare class YouNeedSuggestion<T> {
    private keyNameList;
    private dataSource;
    private options;
    constructor(dataSource: T[], options: Partial<YouNeedSuggestionOptions>);
    private parseValue;
    private parseKeyNameList;
    private getMaxSimilarity;
    get(val: string): YouNeedSuggestResult<T>[];
}

export { YouNeedSuggestion };
export type { YouNeedSuggestResult, YouNeedSuggestionOptions };
