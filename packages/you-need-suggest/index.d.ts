interface DistanceWeightOptions {
    continuous: number;
    count: number;
    position: number;
    distance: number;
}
declare const adaptor: (options?: DistanceWeightOptions) => (inputValue: string, comparedValue: string) => number;

interface YouNeedSuggestionOptions {
    keyNameList: string | string[];
    filterEmptyValue: boolean;
    caseSensitive: boolean;
    minSimilarity: number;
    calc: (sourceStr: string, targetStr: string) => number;
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

export { YouNeedSuggestion, adaptor as calcOfLevenshteinDistanceAdaptor };
export type { YouNeedSuggestResult, YouNeedSuggestionOptions };
