function calculateSum(x, y) {
  // 故意引入运行时错误：访问未定义的变量
  console.log('计算开始:', undefinedVariable); // 这里会抛出 ReferenceError
  return x + y;
}

function processData(data) {
  // 故意引入运行时错误：调用不存在的方法
  return data.map(item => {
    return item.nonExistentMethod(); // 这里会抛出 TypeError
  });
}

function divideNumbers(a, b) {
  // 故意引入运行时错误：除零操作和类型错误
  if (typeof a !== 'number') {
    throw new Error('参数a必须是数字类型，当前位置在第16行');
  }
  return a / b; // 当b为0时会返回Infinity，但我们可以添加更明确的错误
}

function accessProperty(obj) {
  // 故意引入运行时错误：访问null/undefined的属性
  return obj.someProperty.nestedProperty; // 当obj为null时会抛出TypeError
}

module.exports = {
  calculateSum,
  processData,
  divideNumbers,
  accessProperty
};