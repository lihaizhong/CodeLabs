import { Parser, Poster } from "../../utils/fuck-svga";
import ReadyGo from "../../utils/ReadyGo";

let poster;
let parser;
const readyGo = new ReadyGo();

Component({
  properties: {
    url: {
      type: String,
      value: "",
    },
    frame: {
      type: Number,
      value: 5,
    }
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
      poster = new Poster();
      await poster.setConfig("#palette", this);
      readyGo.go();
    },
    detached() {
      readyGo.reset();
      poster.destroy();
      poster = null;
      parser = null;
    },
  },

  data: {
    message: "",
  },

  methods: {
    async initialize() {
      try {
        this.setData({ message: "准备下载资源" });
        const videoItem = await parser.load(this.properties.url);
        this.setData({ message: "下载资源成功" });
        await poster.mount(videoItem, this.properties.frame);
        this.setData({ message: "资源装载成功" });
        poster.draw();
        this.setData({ message: "" });
      } catch (ex) {
        console.error("svga初始化失败！", ex);
        this.setData({ message: ex.message + "\n" + ex.stack });
      }
    }
  },
});
