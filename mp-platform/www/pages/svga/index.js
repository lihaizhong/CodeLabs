import {
  Player,
  Parser,
  VideoEditor,
  VideoManager,
  benchmark,
} from "octopus-svga";
import Page from "../../utils/Page";
import {
  svgaSources,
  svgaCustomSources,
  svgaLargeSources,
  yySources,
  svgaHugeSources,
  getOneAtRandom,
} from "../../utils/constants";
import ReadyGo from "../../utils/ReadyGo";
import { EnhancedWorker } from "../../utils/EnhancedWorker";

let player;
const playerAwait = async () => {
  player = new Player();
  player.onStart = async () => {
    benchmark.mark("持续时间");
    benchmark.mark("总消耗时间");

    const bucket = await videoManager.get();

    benchmark.log(
      "---- START ----",
      "每帧期望消耗时长",
      1000 / bucket.entity.fps,
      "预期总消耗时长",
      (bucket.entity.frames / bucket.entity.fps) * 1000
    );
  };
  player.onProcess = (percent, frame) => {
    benchmark.log("---- UPDATE ----", "当前进度", percent, "当前帧数", frame);
    benchmark.mark("持续时间");
  };
  player.onEnd = () => {
    benchmark.log("---- END ----");
    benchmark.mark("总消耗时间");
    benchmark.reset("持续时间");
    benchmark.reset("总消耗时间");
  };
  await player.setConfig({
    container: "#palette",
    loop: 1,
    playMode: "forwards",
    fillMode: "backwards",
    // contentMode: "aspect-fill",
    // contentMode: "fill",
    contentMode: "aspect-fit",
    // contentMode: "center",
  });

  benchmark.time("创建 100 个 Image 元素的总时长", () => {
    for (let i = 0; i < 100; i++) {
      new Image();
    }
  });
};
const worker = new EnhancedWorker();
const readyGo = new ReadyGo();
const videoManager = new VideoManager("fast", {
  preprocess: (bucket) =>
    new Promise((resolve) => {
      worker.once(bucket.origin, (data) => resolve(data));
      worker.emit(bucket.origin, bucket.origin);
    }),
  postprocess: (bucket, buff) => Parser.parseVideo(buff, bucket.origin, false),
});

Page({
  data: {
    sources: [
      svgaSources,
      svgaCustomSources,
      yySources,
      svgaLargeSources,
      svgaHugeSources,
    ][0],
    current: 0,
    message: "",
  },

  bindEvents: {
    "#prevbtn:click": "handleSwitchPrev",
    "#nextbtn:click": "handleSwitchNext",
    "#trybtn:click": "handleSwitchAtRandom",
  },

  observers: {
    current(value) {
      benchmark.log("当前动效位置", value);
      readyGo.ready(this.initialize.bind(this));
    },
    message(value) {
      showPopup(value);
    },
  },

  handleSwitchAtRandom() {
    const { sources } = this;
    const { ranIndex } = getOneAtRandom(sources);

    this.setData({ current: ranIndex });
  },

  handleSwitchPrev() {
    const { current, sources } = this.data;
    let prev = current - 1;

    if (prev < 0) {
      prev = sources.length - 1;
    }

    this.setData({ current: prev });
  },

  handleSwitchNext() {
    const { current, sources } = this.data;
    let next = current + 1;

    if (next > sources.length - 1) {
      next = 0;
    }

    this.setData({ current: next });
  },

  async initialize() {
    try {
      const { current, sources } = this.data;
      const source = sources[current];
      const bucket = await videoManager.go(current);

      if (typeof source === "object" && source !== null && source.replace) {
        const editor = new VideoEditor(
          player.painter,
          player.resource,
          bucket.entity
        );

        this.setData({ message: "文件编辑中" });
        await benchmark.time("replace images", () =>
          Promise.all(
            Object.keys(source.replace).map((key) =>
              editor.setImage(key, source.replace[key])
            )
          )
        );
      }

      this.setData({ message: "资源装载中..." });
      benchmark.log(source, bucket);
      await benchmark.time("mount", () => player.mount(bucket.entity));
      // player.stepToPercentage(0.3);
      player.start();
      this.setData({ message: "" });
    } catch (ex) {
      console.error("svga初始化失败", ex);
      this.setData({ message: ex.message + "\n" + ex.stack });
    }
  },

  async onLoad() {
    worker.open();
    await playerAwait();
    const urls = this.data.sources.map((item) =>
      typeof item === "string" ? item : item.url
    );

    benchmark.log("准备资源中");
    await videoManager.prepare(urls, 0, urls.length);
    benchmark.log("组件准备就绪");
    readyGo.go();
    this.setData({ current: 0 });
  },

  onUnload() {
    readyGo.reset();
    videoManager.clear();
    worker.close();
    player?.destroy();
    player = null;
  },
});

function showPopup(message) {
  const $popup = document.querySelector("#popup");

  if (message) {
    $popup.innerText = message;
    $popup.style.display = "block";
  } else {
    $popup.innerText = "";
    $popup.style.display = "none";
  }
}
