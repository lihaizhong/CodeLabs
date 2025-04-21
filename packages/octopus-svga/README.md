# FuckSVGA

这是一个 SVGA 在移动端 **Web/小程序** 上的播放器，它的目标是 **更轻量**、**更高效**

## 实现

- [x] 体积 < 60kb (gzip < 18kb)
- [x] 兼容 Android 4.4+ / iOS 9+
- [x] 支持双缓冲渲染机制
- [x] 支持分片渲染机制
- [x] 支持基于SVGA格式的模版海报绘制

## 实验性

- [ ] 渲染引擎模拟运行在 WebWorker
- [ ] 使用 WebAssembly 替代 WebWorker
- [ ] GPU 加速运算
- [ ] 更好的异步操作
- [ ] 多线程 (WebWorker) 解析文件数据

## 注意事项

- 不支持播放 SVGA 1.x 格式
- 不支持声音播放

## 安装

### NPM

```sh
npm i fuck-svga -S
```

## 使用

### 简单使用

```html
<canvas id="container"></canvas>
<!-- <canvas id="secondary"></canvas> -->
```

```js
import { Parser, Player } from "fuck-svga";

const player = new Player();
await player.setConfig({
  // 主屏Canvas选择器
  container: "#container",
  // 辅助Canvas选择器（不设置默认会使用OffscreenCanvas代替，微信小程序建议使用Canvas作为辅助渲染屏）
  // secondary: "#secondary",
});

// 加载并解析svga文件
const parser = new Parser();
const videoItem = await parser.load("xx.svga");

await player.mount(videoItem);

// 绑定事件方法
player.onStart = () => console.log("onStart");
player.onResume = () => console.log("onResume");
player.onPause = () => console.log("onPause");
player.onStop = () => console.log("onStop");
player.onProcess = (percent, frame) => console.log("onProcess", percent, frame);
player.onEnd = () => console.log("onEnd");

// 开始播放动画
player.start();
```

### PlayerConfigOptions

```ts
const enum PLAYER_FILL_MODE {
  // 播放完成后停在首帧
  FORWARDS = 'forwards',
  // 播放完成后停在尾帧
  BACKWARDS = 'backwards'
}

const enum PLAYER_PLAY_MODE {
  // 顺序播放
  FORWARDS = 'forwards',
  // 倒序播放
  FALLBACKS = 'fallbacks'
}

const enum PLAYER_CONTENT_MODE {
  /**
   * 缩放图片填满 Canvas，图片可能出现变形
   */
  FILL = 'fill',
  /**
   * 等比例缩放至整张图片填满 Canvas，不足部分留白
   */
  ASPECT_FIT = 'aspect-fit',
  /**
   * 等比例缩放至图片填满 Canvas，超出部分不展示
   */
  ASPECT_FILL = 'aspect-fill',
  /**
   * 图片对齐 Canvas 中心，超出部分不展示
   */
  CENTER = 'center'
}

await player.setConfig({
  // 主屏，播放动画的 Canvas 元素
  container: string

  // 副屏，播放动画的 Canvas 元素(如不添加，会使用OffscreenCanvas代替)
  secondary?: string

  // 循环次数，默认值 0（无限循环）
  loop?: number | boolean

  // 最后停留的目标模式，默认值 backwards
  // 类似于 https://developer.mozilla.org/en-US/docs/Web/CSS/animation-fill-mode
  fillMode?: PLAYER_FILL_MODE

  // 播放模式，默认值 forwards
  playMode?: PLAYER_PLAY_MODE

  // 填充模式，类似于 content-mode，默认值 fill
  contentMode?: PLAYER_CONTENT_MODE

  // 开始播放的帧数，默认值 0
  startFrame?: number

  // 结束播放的帧数，默认值 0
  endFrame?: number

  // 第一轮循环的位置，默认值 0
  loopStartFrame?: number

  // 是否开启动画容器视窗检测，默认值 false
  // 开启后利用 Intersection Observer API 检测动画容器是否处于视窗内，若处于视窗外，停止描绘渲染帧避免造成资源消耗
  // public isUseIntersectionObserver = false;

  // 是否开启缓存已播放过的帧数据，默认值 false
  // 开启后对已绘制的帧进行缓存，提升重复播放动画性能
  // isCacheFrames?: boolean
})
```

### 指定帧/百分比进度播放

```js
// 从第 10 帧开始播放
player.stepToFrame(10, true);

// 从 50% 进度开始播放
player.stepToPercentage(0.5, true);
```

### 替换元素 / 插入动态元素

可通过修改解析后的数据元，从而实现修改元素、插入动态元素功能

```js
import { platform } from "fuck-svga";

const videoItem = await parser.load("xx.svga");
const { canvas, context } = platform.getCanvas("#container", this);

// 替换元素
const image = platform.image.load(
  canvas,
  "https://xxx.com/xxx.png",
  "xxx.png"
);
videoItem.replaceElements["rep_elem_key"] = image;

// 动态元素
canvas.height = 30;
context.font = "30px Arial";
context.textAlign = "center";
context.textBaseline = "middle";
context.fillStyle = "#000";
context.fillText(
  "hello svga!",
  context.clientWidth / 2,
  context.clientHeight / 2
);
videoItem.dynamicElements["dyn_elem_key"] = canvas;

await player.mount(videoItem);
```

## 画布清理方案

RESIZE: 利用 Canvas 宽高变化会自动清除画布特性。
CLEAR: 利用 Canvas 上下文的 `clearRect` 方法。
CREATE: 重新创建 OffscreenCanvas 实例。

|                | Canvas | OffscreenCanvas |
| -------------- | ------ | --------------- |
| 微信小程序     | RESIZE | RESIZE          |
| 支付宝小程序   | CLEAR  | RESIZE          |
| 抖音小程序     | RESIZE | CLEAR           |
| 浏览器         | RESIZE | RESIZE          |
| Firefox 浏览器 | RESIZE | CREATE          |

<!-- ## 画布交换方案 -->

<!-- DRAW: 使用 `drawImage` 实现双缓存之间的数据交换。 -->
<!-- PUT: 使用 `putImageData` 实现双缓存之间的数据交换。 -->

<!-- |              | Canvas        | OffscreenCanvas | -->
<!-- | ------------ | ------------- | --------------- | -->
<!-- | 微信小程序   | DRAW          | PUT             | -->
<!-- | 支付宝小程序 | PUT(iOS)/DRAW | DRAW            | -->
<!-- | 抖音小程序   | PUT           | DRAW            | -->
<!-- | 浏览器       | DRAW          | DRAW            | -->

<!-- PS: **选择哪种数据交换方案是出于对当前平台支持的能力以及性能考量做出的决定。** -->

## LICENSE

[Apache License 2.0](./LICENSE)
