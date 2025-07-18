class DistanceCalculator {
    // 最大的匹配词长度
    continuous = 0;
    // 匹配词总个数
    count = 0;
    // 首个匹配字符的位置
    position = 0;
    // 最短编辑距离
    distance = 0;
    // 权重计算配置项
    options = {
        continuous: 0.3,
        count: 0.2,
        position: 0.1,
        distance: 0.4,
    };
    constructor(options) {
        Object.assign(this.options, options);
    }
    initialize(position) {
        this.continuous = 0;
        this.count = 0;
        this.position = position;
        this.distance = -1;
    }
    setContinuous(continuous) {
        if (this.continuous < continuous) {
            this.continuous = continuous;
        }
    }
    setCount(count) {
        this.count = count;
    }
    setPosition(position) {
        this.position = position;
    }
    setDistance(distance) {
        this.distance = distance;
    }
    calc(sourceLength, targetLength) {
        const { continuous, count, position, distance, options } = this;
        return ((1 - distance / Math.max(sourceLength, targetLength)) * options.distance +
            (1 - position / targetLength) * options.position +
            (continuous / targetLength) * options.continuous +
            (count / targetLength) * options.count);
    }
    get(inputValue, comparedValue) {
        const sourceLength = inputValue.length;
        const targetLength = comparedValue.length;
        const space = new Array(targetLength);
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
            const matchPositionList = [];
            // 连续字符长度
            let continuous = 0;
            // 0 为不需要做增删改的操作，1 为需要做增删改操作
            let modifyNum = 0;
            for (let row = 0; row < sourceLength; row++) {
                const sourceChar = inputValue[row];
                let temp = row;
                let matchIndex = -1;
                for (let col = 0; col < targetLength; col++) {
                    const targetChar = comparedValue[col];
                    // 前一个编辑距离
                    const prevDistance = col === 0 ? row + 1 : space[col - 1];
                    // 上一个编辑距离
                    const topDistance = space[col] === undefined ? col + 1 : space[col];
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
                    const min = Math.min(prevDistance + 1, topDistance + 1, temp + modifyNum);
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
    }
}
const adaptor = (options) => (inputValue, comparedValue) => new DistanceCalculator(options).get(inputValue, comparedValue);

class YouNeedSuggestion {
    keyNameList;
    dataSource;
    options = {
        // 进行匹配的字段
        keyNameList: ["text"],
        // 是否过滤空值
        filterEmptyValue: true,
        // 是否区分大小写
        caseSensitive: false,
        // 最小相似度
        minSimilarity: 0,
        // 计算器
        calc: adaptor(),
    };
    constructor(dataSource, options) {
        Object.assign(this.options, options);
        this.dataSource = dataSource;
        this.keyNameList = this.parseKeyNameList(this.options.keyNameList);
    }
    parseValue(value) {
        const { caseSensitive } = this.options;
        if (typeof value !== "string") {
            return "";
        }
        // 不区分大小写时，需要将字符串转换为小写
        return caseSensitive ? value : value.toLowerCase();
    }
    parseKeyNameList(keyNameList) {
        if (typeof keyNameList === "string") {
            return keyNameList.split(",");
        }
        if (Array.isArray(keyNameList)) {
            return keyNameList;
        }
        return ["value"];
    }
    getMaxSimilarity(value, match) {
        if (typeof value === "string" &&
            value === "" &&
            this.options.filterEmptyValue) {
            return 100;
        }
        if (typeof match === "string") {
            return this.options.calc(this.parseValue(match), value);
        }
        return this.keyNameList.reduce((lastSimilarity, key) => {
            const sourceStr = this.parseValue(match[key]);
            const currentSimilarity = this.options.calc(sourceStr, value);
            return Math.max(lastSimilarity, currentSimilarity);
        }, Number.NEGATIVE_INFINITY);
    }
    get(val) {
        const result = [];
        const value = this.parseValue(val);
        for (let i = 0; i < this.dataSource.length; i++) {
            const match = this.dataSource[i];
            const similarity = this.getMaxSimilarity(value, match);
            if (similarity >= this.options.minSimilarity) {
                result.push({ data: match, similarity });
            }
        }
        return result.sort((a, b) => b.similarity - a.similarity);
    }
}

export { YouNeedSuggestion, adaptor as calcOfLevenshteinDistanceAdaptor };
