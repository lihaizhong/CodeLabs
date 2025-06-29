import {
  Parser,
  Player,
  VideoEditor,
  VideoManager,
  benchmark,
} from "../../utils/fuck-svga";
import ReadyGo from "../../utils/ReadyGo";
import { SvgaWorker } from "./worker";

let player;
const playerAwait = async (scope) => {
  let loopStartTime;
  let startTime;

  player = new Player();
  player.onStart = async () => {
    startTime = loopStartTime = benchmark.now();

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
    let loopEndTime = benchmark.now();

    benchmark.log(
      "---- UPDATE ----",
      "当前进度",
      percent,
      "当前帧",
      frame,
      "持续时间",
      loopEndTime - loopStartTime
    );

    loopStartTime = loopEndTime;
  };
  player.onEnd = () => {
    benchmark.log("---- END ----", "总消耗时间", benchmark.now() - startTime);
  };
  await player.setConfig(
    {
      container: "#palette",
      loop: 1,
      playMode: "forwards",
      fillMode: "backwards",
      contentMode: "aspect-fit",
    },
    scope
  );
};
const worker = new SvgaWorker();
const readyGo = new ReadyGo();
const decompress = (url, buff) =>
  new Promise((resolve) => {
    worker.once(url, (data) => resolve(data));
    worker.emit(url, buff);
  });
const videoManager = new VideoManager("fast", { decompress });

Component({
  properties: {
    current: {
      type: Number,
      value: 0,
    },
    sources: {
      type: Array,
      value: [],
    },
  },

  observers: {
    current(value) {
      benchmark.log("当前动效位置", value);
      readyGo.ready(this.initialize.bind(this));
    },
  },

  lifetimes: {
    ready() {
      worker.open();
      Promise.all([playerAwait(this)])
        .then(() => {
          const urls = this.properties.sources.map((item) =>
            typeof item === "string" ? item : item.url
          );

          benchmark.log("准备资源中");
          return videoManager.prepare(urls);
        })
        .then(() => {
          benchmark.log("组件准备就绪");
          readyGo.go();
        });
    },
    detached() {
      readyGo.reset();
      videoManager.clear();
      worker.close();
      player?.destroy();
    },
  },

  data: {
    message: "",
  },

  methods: {
    async initialize() {
      try {
        const { current, sources } = this.properties;
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
    handlePlay() {
      player?.start();
    },
    handleResume() {
      player?.resume();
    },
    handlePause() {
      player?.pause();
    },
    handleStop() {
      player?.stop();
    },
  },
});
