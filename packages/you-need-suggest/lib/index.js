(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.OctopusSvga = {}));
})(this, (function (exports) { 'use strict';

    var DistanceCalculator = /** @class */ (function () {
        function DistanceCalculator(options) {
            // 最大的匹配词长度
            this.continuous = 0;
            // 匹配词总个数
            this.count = 0;
            // 首个匹配字符的位置
            this.position = 0;
            // 最短编辑距离
            this.distance = 0;
            // 权重计算配置项
            this.options = {
                continuous: 0.3,
                count: 0.2,
                position: 0.1,
                distance: 0.4,
            };
            Object.assign(this.options, options);
        }
        DistanceCalculator.prototype.initialize = function (position) {
            this.continuous = 0;
            this.count = 0;
            this.position = position;
            this.distance = -1;
        };
        DistanceCalculator.prototype.setContinuous = function (continuous) {
            if (this.continuous < continuous) {
                this.continuous = continuous;
            }
        };
        DistanceCalculator.prototype.setCount = function (count) {
            this.count = count;
        };
        DistanceCalculator.prototype.setPosition = function (position) {
            this.position = position;
        };
        DistanceCalculator.prototype.setDistance = function (distance) {
            this.distance = distance;
        };
        DistanceCalculator.prototype.calc = function (sourceLength, targetLength) {
            var _a = this, continuous = _a.continuous, count = _a.count, position = _a.position, distance = _a.distance, options = _a.options;
            return ((1 - distance / Math.max(sourceLength, targetLength)) * options.distance +
                (1 - position / targetLength) * options.position +
                (continuous / targetLength) * options.continuous +
                (count / targetLength) * options.count);
        };
        DistanceCalculator.prototype.get = function (inputValue, comparedValue) {
            var sourceLength = inputValue.length;
            var targetLength = comparedValue.length;
            var space = new Array(targetLength);
            this.initialize(targetLength - 1);
            // 过滤目标或者比较值为空字符串的情况
            if (sourceLength === 0) {
                this.setDistance(targetLength);
            }
            else if (targetLength === 0) {
                this.setDistance(sourceLength);
            }
            else {
                // 保存所有匹配到的字符的index
                var matchPositionList = [];
                // 连续字符长度
                var continuous = 0;
                // 0 为不需要做增删改的操作，1 为需要做增删改操作
                var modifyNum = 0;
                for (var row = 0; row < sourceLength; row++) {
                    var sourceChar = inputValue[row];
                    var temp = row;
                    var matchIndex = -1;
                    for (var col = 0; col < targetLength; col++) {
                        var targetChar = comparedValue[col];
                        // 前一个编辑距离
                        var prevDistance = col === 0 ? row + 1 : space[col - 1];
                        // 上一个编辑距离
                        var topDistance = space[col] === undefined ? col + 1 : space[col];
                        if (sourceChar === targetChar) {
                            modifyNum = 0;
                            // 解决重复匹配的问题
                            if (matchIndex === -1 && !matchPositionList.includes(col)) {
                                matchIndex = col;
                            }
                            // 设置首位匹配到的字符
                            if (this.position === targetLength) {
                                this.setPosition(col);
                            }
                        }
                        else {
                            modifyNum = 1;
                        }
                        // 获取增，删，改和不变得到的最小值
                        var min = Math.min(prevDistance + 1, topDistance + 1, temp + modifyNum);
                        // 保存左上角的数据，计算最小值时需要用到
                        temp = topDistance;
                        space[col] = min;
                    }
                    // 如果匹配到了结果
                    if (matchIndex !== -1) {
                        if (row > 0 &&
                            matchIndex > 0 &&
                            inputValue[row - 1] === comparedValue[matchIndex - 1]) {
                            if (continuous === 0) {
                                continuous = 2;
                            }
                            else {
                                continuous++;
                            }
                        }
                        else if (continuous === 0) {
                            continuous++;
                        }
                        else {
                            // 设置最长的连续字符
                            this.setContinuous(continuous);
                            continuous = 1;
                        }
                        matchPositionList.push(matchIndex);
                    }
                    else {
                        // 设置最长的连续字符
                        this.setContinuous(continuous);
                        continuous = 0;
                    }
                }
                // 设置最长的连续字符
                this.setContinuous(continuous);
                // 设置匹配到的数量
                this.setCount(matchPositionList.length);
                // 设置编辑距离
                this.setDistance(space[targetLength - 1]);
            }
            return this.calc(inputValue.length, comparedValue.length);
        };
        return DistanceCalculator;
    }());
    var compareAdaptor = function (options) {
        return function (inputValue, comparedValue) {
            return new DistanceCalculator(options).get(inputValue, comparedValue);
        };
    };

    var YouNeedSuggestion = /** @class */ (function () {
        function YouNeedSuggestion(dataSource, options) {
            this.options = {
                // 进行匹配的字段
                keyNameList: ["text"],
                // 是否过滤空值
                filterEmptyValue: true,
                // 是否区分大小写
                caseSensitive: false,
                // 最小相似度
                minSimilarity: 0,
                // 计算算法
                compare: compareAdaptor(),
            };
            Object.assign(this.options, options);
            this.dataSource = dataSource;
            this.keyNameList = this.parseKeyNameList(this.options.keyNameList);
        }
        YouNeedSuggestion.prototype.parseValue = function (value) {
            var caseSensitive = this.options.caseSensitive;
            if (typeof value !== "string") {
                return "";
            }
            // 不区分大小写时，需要将字符串转换为小写
            return caseSensitive ? value : value.toLowerCase();
        };
        YouNeedSuggestion.prototype.parseKeyNameList = function (keyNameList) {
            if (typeof keyNameList === "string") {
                return keyNameList.split(",");
            }
            if (Array.isArray(keyNameList)) {
                return keyNameList;
            }
            return ["value"];
        };
        YouNeedSuggestion.prototype.getMaxSimilarity = function (value, match) {
            var _this = this;
            if (typeof value === "string" &&
                value === "" &&
                this.options.filterEmptyValue) {
                return 100;
            }
            if (typeof match === "string") {
                return this.options.compare(this.parseValue(match), value);
            }
            return this.keyNameList.reduce(function (lastSimilarity, key) {
                var sourceStr = _this.parseValue(match[key]);
                var currentSimilarity = _this.options.compare(sourceStr, value);
                return Math.max(lastSimilarity, currentSimilarity);
            }, Number.NEGATIVE_INFINITY);
        };
        YouNeedSuggestion.prototype.get = function (val) {
            var result = [];
            var value = this.parseValue(val);
            for (var i = 0; i < this.dataSource.length; i++) {
                var match = this.dataSource[i];
                var similarity = this.getMaxSimilarity(value, match);
                if (similarity >= this.options.minSimilarity) {
                    result.push({ data: match, similarity: similarity });
                }
            }
            return result.sort(function (a, b) {
                return b.similarity - a.similarity;
            });
        };
        return YouNeedSuggestion;
    }());

    exports.YouNeedSuggestion = YouNeedSuggestion;
    exports.compareOfLevenshteinDistanceAdaptor = compareAdaptor;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
