import { Parser, Player, VideoEditor, benchmark } from "../../utils/fuck-svga";
import ReadyGo from "../../utils/ReadyGo";

let player;
let parser;
const readyGo = new ReadyGo();
const cache = new Map();

Component({
  options: {
    lifetimes: true,
    observers: true,
    virtualHost: false,
  },

  props: {
    source: {
      type: [String, Object],
      value: "",
    },
  },

  observers: {
    source(value) {
      const url = typeof value === "string" ? value : value?.url;

      if (url !== "") {
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
          loop: 1,
          playMode: "fallbacks",
          fillMode: "forwards"
        },
        this
      );
      player.onProcess = (percent, frame) => {
        console.log('当前进度', percent, frame)
        console.log('---- UPDATE ----')
      };
      player.onEnd = () => {
        console.log('---- END ----')
      };
      readyGo.go();
    },
    detached() {
      readyGo.reset();
      player?.destroy();
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
        const { source } = this.props;
        let videoItem

        if (cache.has(source)) {
          this.setData({ message: "匹配到缓存" })
          videoItem = cache.get(source);
        } else {
          this.setData({ message: "准备下载资源" });
          await benchmark.time('load', async () => {
            if (typeof source === "string") {
              videoItem = await parser.load(source);            
            } else {
              videoItem = await parser.load(source.url);
  
              // 替换元素
              if (source.replace) {
                const editor = new VideoEditor(videoItem);
  
                await Promise.all(
                  Object.entries(source.replace).map(([key, value]) =>
                    editor.setImage(key, value)
                  )
                );
              }
            }
          });

          cache.set(source, videoItem);
          this.setData({ message: "下载资源成功" });
        }

        console.log(source, videoItem);
        await benchmark.time('mount', () => player.mount(videoItem));
        this.setData({ message: "资源装载成功" });
        // player.stepToPercentage(0.3);
        player.start();
        this.setData({ message: "" });
      } catch (ex) {
        console.error("svga初始化失败！", ex);
        this.setData({ message: ex.message + "\n" + ex.stack });
      }
    },
    handlePlay() {
      player?.start()
    },
    handleResume() {
      player?.resume()
    },
    handlePause() {
      player?.pause()
    },
    handleStop() {
      player?.stop()
    }
  },
});
