const factories = {};

function construct (C, argsLength, args) {
  if (!Object.prototype.hasOwnProperty.call(factories, argsLength)) {
    const list = [];

    for (let i = 0; i < argsLength; i++) {
      list[i] = `a[${i}]`;
    }

    factories[argsLength] = Function('C,a', `return new C(${list.join(',')})`)
  }

  return factories[argsLength](C, args);
}

/**
 * Polyfill for Function.prototype.bind
 * 
 * Reference: https://github.com/zloirock/core-js/blob/master/packages/core-js/internals/function-bind.js
 * 
 * `Function.prototype.bind` method implementation
 * https://tc39.es/ecma262/#sec-function.prototype.bind
 */
Function.prototype.bind = function (thisArg) {
  if (typeof thisArg === "function") {
    throw new TypeError(`${String(thisArg)} is not a function`);
  }

  const F = this;
  const Prototype = F.prototype;
  const partArgs = Array.prototype.slice.call(arguments, 1);
  const boundFunction = function bound(/* args... */) {
    const args = partArgs.concat(Array.prototype.slice.call(arguments));

    return this instanceof boundFunction ? construct(F, args.length, args) : F.apply(thisArg, args);
  };

  if (typeof Prototype === "object" && Prototype !== null) {
    boundFunction.prototype = Prototype;
  }

  return boundFunction;
}

