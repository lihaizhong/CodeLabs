# Octopus Svga

这是一个 SVGA 在移动端 **Web/小程序** 上的播放器，设计它的目标是 **解析速度更快**、**体积更小**、**性能更高**、**兼容性更高**、**功能更丰富**。

## 实现

- [x] 兼容 Android 4.4+ / iOS 9+
- [x] 整体大小 **\<70Kb**（核心体积\<下载解析器 + 播放器> **~40Kb**）
- [x] 支持 **双缓冲渲染机制** + **指数退避算法** 提升渲染性能
- [x] 支持基于 SVGA 格式的 **模版海报** 绘制 _（需配合 png 图片生成器使用）_
- [x] 支持动效文件 **管理器** _（支持自定义下载、解压、解析的策略）_
- [x] 支持动效文件 **编辑器** _（支持图片和二维码生成和替换，也可以自定义绘图）_
- [x] 内置 **二维码生成器**
- [x] 内置 **png 图片生成器**

## 暂未实现

- [ ] Web 端支持 **IndexDB**
- [ ] 支持 **IntersectionObserver**

## 注意事项

- 不支持播放 SVGA 1.x 格式
- 不支持声音播放

## 架构设计

![ArchitectureDesign](/public/source/svga-architecture-design.png)

## 安装

### NPM

```sh
npm i octopus-svga -S
```

注意：**如果你使用 `ESM` 模块，需要安装 `npm i octopus-platform -S`。**

## 配置项

### PlayerConfigOptions

```ts
const enum PLAYER_FILL_MODE {
  // 播放完成后停在首帧
  FORWARDS = "forwards",
  // 播放完成后停在尾帧
  BACKWARDS = "backwards",
  // 播放完成后清空
  NONE = "none",
}

const enum PLAYER_PLAY_MODE {
  // 顺序播放
  FORWARDS = "forwards",
  // 倒序播放
  FALLBACKS = "fallbacks",
}

const enum PLAYER_CONTENT_MODE {
  /**
   * 缩放图片填满 Canvas，图片可能出现变形
   */
  FILL = "fill",
  /**
   * 等比例缩放至整张图片填满 Canvas，不足部分留白
   */
  ASPECT_FIT = "aspect-fit",
  /**
   * 等比例缩放至图片填满 Canvas，超出部分不展示
   */
  ASPECT_FILL = "aspect-fill",
  /**
   * 图片对齐 Canvas 中心，超出部分不展示
   */
  CENTER = "center",
}

export interface PlayerConfig {
  /**
   * 循环次数，默认值 0（无限循环）
   */
  loop: number;
  /**
   * 最后停留的目标模式，类似于 animation-fill-mode，默认值 forwards。
   */
  fillMode: PLAYER_FILL_MODE;
  /**
   * 播放模式，默认值 forwards
   */
  playMode: PLAYER_PLAY_MODE;
  /**
   * 填充模式，类似于 content-mode。
   */
  contentMode: PLAYER_CONTENT_MODE;
  /**
   * 开始播放的帧数，默认值 0
   */
  startFrame: number;
  /**
   * 结束播放的帧数，默认值 0
   */
  endFrame: number;
  /**
   * 循环播放的开始帧，默认值 0
   */
  loopStartFrame: number;
}

export type PlayerConfigOptions = Partial<PlayerConfig> & {
  /**
   * 主屏，播放动画的 Canvas 元素
   */
  container: string;
  /**
   * 副屏，播放动画的 Canvas 元素
   */
  secondary?: string;
};
```

### PosterConfigOptions

```ts
export interface PosterConfig {
  /**
   * 主屏，绘制海报的 Canvas 元素
   */
  container: string;
  /**
   * 填充模式，类似于 content-mode。
   */
  contentMode: PLAYER_CONTENT_MODE;
  /**
   * 绘制成海报的帧，默认是0。
   */
  frame: number;
}

export type PosterConfigOptions = Partial<PosterConfig>;
```

## 使用

### 简单使用

```html
<canvas id="container"></canvas>
<!-- <canvas id="secondary"></canvas> -->
```

```ts
import { Parser, Player } from "octopus-svga";

const player = new Player();
await player.setConfig({
  // 主屏Canvas选择器
  container: "#container",
  // 辅助Canvas选择器（不设置默认会使用离屏渲染代替）
  // secondary: "#secondary",
});

// 加载并解析svga文件
const videoItem = await Parser.load("xx.svga");

// 绑定事件方法
player.onStart = () => console.log("onStart");
player.onResume = () => console.log("onResume");
player.onPause = () => console.log("onPause");
player.onStop = () => console.log("onStop");
player.onProcess = (percent, frame) => console.log("onProcess", percent, frame);
player.onEnd = () => console.log("onEnd");

await player.mount(videoItem);
// 开始播放动画
player.start();
```

### 播放器方法

```js
// 开始播放，会重置状态
player.start();
// 停止播放，会重置状态
player.stop();
// 重新播放，不会重置状态
player.resume();
// 暂停播放，不会重置状态
player.pause();
```

### 指定帧/百分比进度播放

```js
// 从第 10 帧开始播放
player.stepToFrame(10, true);
// 从 50% 进度开始播放
player.stepToPercentage(0.5, true);
```

### Parser 解析器

```js
// 加载svga文件（这是一个复合功能，包含以下三个功能）
await Parser.load(url);
// 下载svga文件
await Parser.download(url);
// 解压svga文件
Parser.decompress(buff);
// 解析svga文件
Parser.parseVideo(buff, url, needDecompress);
```

### VideoEditor 动效编辑器

可通过修改解析后的数据元，从而实现修改元素、插入动态元素功能

```html
<img class="poster" src="" />
```

```ts
import {
  Parser,
  Poster,
  VideoEditor,
  getDataURLFromImageData,
} from "octopus-svga";

const videoItem = await Parser.load("xx.svga");
const poster = new Poster(750, 1180);
const videoEditor = new VideoEditor(poster.painter, poster.resource, videoItem);
// 替换元素
// mode A 为追加新图片 R 为替换已有图片
videoEditor.setImage("replace_001", "https://assets.xxx.com/frontend/xxx.png");

const context = videoEditor.getContext();
// 动态元素
context.font = "30px Arial";
context.textAlign = "center";
context.textBaseline = "middle";
context.fillStyle = "#000";
context.fillText(
  "hello svga!",
  context.clientWidth / 2,
  context.clientHeight / 2
);
videoEditor.setCanvas("dynamic_001", context, {
  mode: "A",
  width: 375,
  height: 400,
});

// 添加二维码图片
videoEditor.setQRCode("qrcode_001", "这是二维码图片的文本内容", { size: 40 });

await poster.mount(videoItem);
poster.draw();

const imageData = poster.toImageData();
// 生成base64格式的png图片
document.querySelector(".poster").src = getDataURLFromImageData(imageData);
```

### VideoManager 动效管理器

```ts
import { VideoManager, Player } from "octopus-svga";

const player = new Player();

await player.setConfig({
  container: "#xxxx",
});

// mode: fast模式可以尽快播放当前选中的动效文件，whole模式可以等待动效文件全部下载完成。
const videoManager = new VideoManager("fast");

videoManager.prepare(
  [
    "https://assets.xxx.com/frontend/9ce0cce7205fbebba380ed44879e5660.svga",
    "https://assets.xxx.com/frontend/1ddb590515d196f07c411794633e4406.svga",
    "https://assets.xxx.com/frontend/9a96c2c0fbe8ec39f0a192e3e1303d22.svga",
    "https://assets.xxx.com/frontend/c4b3c4f8a05070352e036e869fc58b2f.svga",
  ],
  0,
  3
);

const bucket = videoManager.go(3);

await player.mount(bucket.entity);

player.start();
```

### VideoManager 动效管理器（worker 加速）

```ts
import { VideoManager, isZlibCompressed } from "octopus-svga";
import { EnhancedWorker } from "../../utils/EnhancedWorker";

const worker = new EnhancedWorker();
// mode: fast模式可以尽快播放当前选中的动效文件，whole模式可以等待动效文件全部下载完成。
const videoManager = new VideoManager("fast", {
  // 这里的预进程使用了worker处理，减少主进程卡顿，加快动效文件解压。
  // 注意：VideoManager本身不提供worker能力，需要自己实现并接入。
  preprocess: (bucket) =>
    new Promise((resolve) => {
      worker.once(bucket.origin, (data) => resolve(data));
      worker.emit(bucket.origin, bucket.origin);
    }),
  postprocess: (bucket, buff) =>
    Parser.parseVideo(
      buff,
      bucket.origin,
      // 检查数据是否已经解压
      isZlibCompressed(buff)
    ),
});
```

具体可参考[这里](/mp-platform/)，了解各个端的 Worker 实现。

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

## OTHER

SVGA AE 设计插件

- [SVGA-AEConverter](https://github.com/abcxo/SVGA-AEConverter)

## LICENSE

[MIT](./LICENSE)
