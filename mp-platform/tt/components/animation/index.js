import {
  Player,
  Parser,
  VideoEditor,
  VideoManager,
  platform,
} from "../../utils/fuck-svga";
import { benchmark } from "../../utils/fuck-benchmark";
import ReadyGo from "../../utils/ReadyGo";
import { EnhancedWorker } from "../../utils/EnhancedWorker";

let player,
  observer = null;
const playerAwait = async (scope) => {
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
    benchmark.log("---- UPDATE ----", "当前进度", percent, "当前帧", frame);
    benchmark.mark("持续时间");
  };
  player.onResume = () => {
    benchmark.log("---- RESUME ----");
  };
  player.onPause = () => {
    benchmark.log("---- PAUSE ----");
  };
  player.onStop = () => {
    benchmark.log("---- STOP ----");
  };
  player.onEnd = () => {
    benchmark.log("---- END ----");
    benchmark.mark("总消耗时间");
    benchmark.reset("持续时间");
    benchmark.reset("总消耗时间");
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

  benchmark.time("创建 100 个 Image 元素的总时长", () => {
    for (let i = 0; i < 100; i++) {
      player.painter.F.createImage();
    }
  });

  observer = tt.createIntersectionObserver(scope, {
    thresholds: [0, 0.5, 1],
    initialRatio: 0,
    nativeMode: true,
  });
  observer.relativeToViewport().observe('#palette', ({ intersectionRatio }) => {
    if (intersectionRatio > 0) {
      player.resume();
    } else {
      player.pause();
    }
  });
};
const worker = new EnhancedWorker();
const readyGo = new ReadyGo();
const videoManager = new VideoManager("fast", {
  preprocess: async (bucket) => {
    const buff = await platform.remote.fetch(bucket.origin);

    return new Promise((resolve) => {
      worker.once(bucket.origin, (data) => resolve(data));
      worker.emit(bucket.origin, buff);
    });
  },
  postprocess: (bucket, data) => Parser.parseVideo(data, bucket.origin, false),
});

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
      observer?.disconnect();
      player = null;
      observer = null;
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
