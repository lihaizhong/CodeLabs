import dfireSvga from "../../utils/svga-2dfire";
import ReadyGo from "../../utils/ReadyGo";

const { Parser, Player } = dfireSvga;

let player;
let parser;
const readyGo = new ReadyGo();

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

      await player.setCanvas("#palette", this);
      player.loops = 1;
      player.playMode = "fallbacks";
      player.fillMode = "forwards";

      player.onPercentage((percent, frame) => {
        console.log('当前进度', percent, frame)
        console.log('---- UPDATE ----')
      });
      player.onFinished(() => {
        console.log('---- END ----')
      });

      readyGo.go();
    },
    detached() {
      readyGo.reset();
      player?.stopAnimation();
      player?.clear();
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
        this.setData({ message: "准备下载资源" });
        const videoItem = await parser.load(this.properties.url);
        this.setData({ message: "下载资源成功" });

        console.log(this.properties.url, videoItem);
        await player.setVideoItem(videoItem);
        this.setData({ message: "资源装载成功" });
        // player.stepToPercentage(0.3);
        player.startAnimation();
        this.setData({ message: "" });
      } catch (ex) {
        console.error("svga初始化失败！", ex);
        this.setData({ message: ex.message + "\n" + ex.stack });
      }
    },
    handlePlay() {
      player?.startAnimation()
    },
    handleResume() {
      player?.startAnimation()
    },
    handlePause() {
      player?.pauseAnimation()
    },
    handleStop() {
      player?.stopAnimation()
    }
  },
});
