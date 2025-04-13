// Copyright 2025 lihaizhong
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     https://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const b64c =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

/**
 * btoa implementation
 * 将一个二进制字符串（例如，将字符串中的每一个字节都视为一个二进制数据字节）编码为 Base64 编码的 ASCII 字符串
 * https://developer.mozilla.org/zh-CN/docs/Web/API/Window/btoa
 * @param data 二进制字符串
 * @returns
 */
export function mbtoa(data: string): string {
  let bitmap,
    a,
    b,
    c,
    result = "",
    rest = data.length % 3;

  for (let i = 0; i < data.length; ) {
    if (
      (a = data.charCodeAt(i++)) > 255 ||
      (b = data.charCodeAt(i++)) > 255 ||
      (c = data.charCodeAt(i++)) > 255
    ) {
      throw new TypeError(
        'Failed to execute "btoa" on "Window": The string to be encoded contains characters outside of the Latin1 range.'
      );
    }

    bitmap = (a << 16) | (b << 8) | c;
    result +=
      b64c.charAt((bitmap >> 18) & 63) +
      b64c.charAt((bitmap >> 12) & 63) +
      b64c.charAt((bitmap >> 6) & 63) +
      b64c.charAt(bitmap & 63);
  }

  return rest ? result.slice(0, rest - 3) + "===".substring(rest) : result;
}
