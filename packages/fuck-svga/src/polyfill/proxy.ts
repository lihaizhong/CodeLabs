export function getProxy<T extends object>(fn: ProxyHandler<T>['get']) {
  return new Proxy({} as T, {
      get: fn,
      set() {
        throw new Error('no modification allowed');
      }
    })
}