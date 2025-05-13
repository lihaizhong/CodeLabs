// 过滤 benchmark 模块
jest.mock("../src/benchmark", () => {
  const noop = () => {};

  return {
    count: 0,
    label: noop,
    time: noop,
    line: noop,
    log: noop,
  };
});
