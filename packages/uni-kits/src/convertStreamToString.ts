/**
 * 流式数据转字符串
 * 真机返回的是ArrayBuffer类型，模拟器返回的是Uint8Array类型
 * @param data {Uint8Array} 原始数据
 * @returns {string}
 */
function convertStreamToStr(data: Uint8Array | ArrayBuffer): string {
  let u8a: Uint8Array

  if (data instanceof ArrayBuffer) {
    u8a = new Uint8Array(data)
  } else {
    u8a = data
  }

  const uri: string = u8a.reduce((p, c) => {
    const uc = c.toString(16)

    return `${p}%${`0${uc}`.slice(uc.length - 1)}`
  }, '')

  return decodeURIComponent(uri)
}
