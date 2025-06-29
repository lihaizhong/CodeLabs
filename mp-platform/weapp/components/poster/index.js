import { Parser, Poster } from "../../utils/fuck-svga";
import ReadyGo from "../../utils/ReadyGo";

const readyGo = new ReadyGo();
let poster;

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
    frame: {
      type: Number,
      value: 0,
    },
  },

  observers: {
    current(value) {
      if (typeof value === "number") {
        readyGo.ready(this.initialize.bind(this));
      }
    },
  },

  lifetimes: {
    async ready() {
      const { windowWidth: width, windowHeight: height } = wx.getWindowInfo();

      poster = new Poster(width, height);
      await poster.setConfig("#palette", this);
      readyGo.go();
    },
    detached() {
      readyGo.reset();
      poster?.destroy();
    },
  },

  data: {
    source: "",
    message: "",
  },

  methods: {
    async initialize() {
      const { current, sources, frame } = this.properties;
      const source = sources[current];
      let videoItem;

      try {
        this.setData({ message: "准备下载资源" });
        if (typeof source === "string") {
          videoItem = await Parser.load(source);
        } else {
          videoItem = await Parser.load(source.url);
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

        this.setData({ message: "下载资源成功" });
        await poster.mount(videoItem, frame);
        this.setData({ message: "资源装载成功" });
        poster.draw();

        this.setData({
          source: poster.toDataURL(),
        });
        this.setData({ message: "" });
      } catch (ex) {
        console.error("svga初始化失败！", ex);
        this.setData({ message: ex.message + "\n" + ex.stack });
      }
    },
  },
});
