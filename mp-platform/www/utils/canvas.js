import { platform } from '@2dfire/meta-svga'

/**
 * 辅助函数：实现文字换行绘制
 * @param {CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D} context
 * @param {string} text
 * @param {number} x
 * @param {number} y
 * @param {number} maxWidth
 * @param {number} lineHeight
 * @returns {number}
 */
export function wrapText(context, text, x, y, maxWidth, lineHeight) {
  // 如果文本为空，直接返回
  if (!text) return 0

  // 分割文本为单个字符，便于计算宽度
  const characters = text.split('')
  let line = ''
  const lines = []

  // 逐个字符计算宽度，超过最大宽度时换行
  for (let i = 0; i < characters.length; i += 1) {
    const testLine = line + characters[i]
    const metrics = context.measureText(testLine)
    const testWidth = metrics.width

    if (testWidth > maxWidth && i > 0) {
      lines.push(line)
      line = characters[i]
    } else {
      line = testLine
    }
  }

  // 添加最后一行
  lines.push(line)

  // 绘制所有行
  for (let i = 0; i < lines.length; i += 1) {
    context.fillText(lines[i], x, y + (i * lineHeight))
  }

  // 返回行数，便于计算总高度
  return lines.length
}

/**
 * 组合字体
 * @param {number} fontWeight 
 * @param {number} fontSize 
 * @param {string} fontFamily 
 * @param {number} dpr 
 * @returns {string}
 */
function combineFontStyle(fontWeight, fontSize, fontFamily, dpr = 1) {
  let font = ''

  if (fontWeight) {
    font += `${fontWeight} `
  }

  if (typeof fontSize === 'number') {
    font += `${fontSize * dpr}px `
  }

  if (fontFamily) {
    font += fontFamily
  }

  return font
}

/**
 * 写入文字
 * @param {CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D} context 
 * @param {string} text 
 * @param {object} options 
 * @property {number} x
 * @property {number} y
 * @property {number} maxWidth
 * @property {number} lineHeight
 * @property {CanvasTextAlign} textAlign
 * @property {string} fillStyle
 * @property {string | number} fontWeight
 * @property {number} fontSize
 * @property {string} fontFamily
 * @returns {number}
 */
export function writeText(context, text, options) {
  const { dpr } = platform.global

  context.save()

  if (options.fontWeight || options.fontSize || options.fontFamily) {
    context.font = combineFontStyle(options.fontWeight, options.fontSize, options.fontFamily, dpr)
  }

  if (options.fillStyle) {
    context.fillStyle = options.fillStyle
  }

  if (options.textAlign) {
    context.textAlign = options.textAlign
  } else {
    context.textAlign = 'left'
  }

  const lines = wrapText(
    context,
    text,
    options.x * dpr,
    (Math.floor((options.lineHeight - options.fontSize) / 2) + options.fontSize + options.y) * dpr,
    options.maxWidth * dpr,
    options.lineHeight * dpr
  )

  context.restore()
  return lines * options.lineHeight
}
