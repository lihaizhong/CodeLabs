import { Parser, Player } from "../../utils/fuck-svga";
import ReadyGo from "../../utils/ReadyGo";

let player;
let parser;
const readyGo = new ReadyGo();
const cache = new Map();

Component({
  properties: {
    url: {
      type: String,
      value: "",
    },
  },

  observers: {
    url(value) {
      if (value !== "") {
        readyGo.ready(this.initialize.bind(this));
      }
    },
  },

  lifetimes: {
    async ready() {
      parser = new Parser();
      player = new Player();
      await player.setConfig(
        {
          container: "#palette",
          secondary: "#secondary",
          loop: 1,
        },
        this
      );
      player.onProcess = (percent, frame, frames) => {
        console.log('当前进度', percent, frame, frames)
        console.log('---- UPDATE ----')
      }
      player.onEnd = () => {
        console.log('---- END ----')
      }
      readyGo.go();
    },
    detached() {
      readyGo.reset();
      this.stop();
      player = null;
      parser = null;
    },
  },

  data: {
    message: "",
  },

  methods: {
    async initialize() {
      try {
        let videoItem

        if (cache.has(this.properties.url)) {
          this.setData({ message: "匹配到缓存" })
          videoItem = cache.get(this.properties.url);
        } else {
          this.setData({ message: "准备下载资源" });
          videoItem = await parser.load(this.properties.url);
          cache.set(this.properties.url, videoItem);
          this.setData({ message: "下载资源成功" });
        }

        console.log(this.properties.url, videoItem);
        await player.mount(videoItem);
        this.setData({ message: "资源装载成功" });
        player.stepToPercentage(0.3);
        player.start();
        this.setData({ message: "" });
      } catch (ex) {
        console.error("svga初始化失败！", ex);
        this.setData({ message: ex.message + "\n" + ex.stack });
      }
    },
    stop() {
      if (player) {
        player.stop();
      }
    },
  },
});
