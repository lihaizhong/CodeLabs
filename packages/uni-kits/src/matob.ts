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
const b64re =
  /^(?:[A-Za-z\d+\/]{4})*?(?:[A-Za-z\d+\/]{2}(?:==)?|[A-Za-z\d+\/]{3}=?)?$/;

/**
 * atob implementation
 * 对经过 Base64 编码的字符串进行解码
 * https://developer.mozilla.org/zh-CN/docs/Web/API/Window/atob
 * @param data base64字符串
 * @returns
 */
export function matob(data: string): string {
  let string = String(data).replace(/[\t\n\f\r ]+/g, "");
  if (!b64re.test(string)) {
    throw new TypeError(
      'Failed to execute "atob" on "Window": The string to be decoded is not correctly encoded.'
    );
  }
  string += "==".slice(2 - (string.length & 3));
  let bitmap,
    result = "",
    r1,
    r2;
  for (let i = 0; i < string.length; ) {
    bitmap =
      (b64c.indexOf(string.charAt(i++)) << 18) |
      (b64c.indexOf(string.charAt(i++)) << 12) |
      ((r1 = b64c.indexOf(string.charAt(i++))) << 6) |
      (r2 = b64c.indexOf(string.charAt(i++)));

    result +=
      r1 === 64
        ? String.fromCharCode((bitmap >> 16) & 255)
        : r2 === 64
        ? String.fromCharCode((bitmap >> 16) & 255, (bitmap >> 8) & 255)
        : String.fromCharCode(
            (bitmap >> 16) & 255,
            (bitmap >> 8) & 255,
            bitmap & 255
          );
  }

  return result;
}
