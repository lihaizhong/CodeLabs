import "weui";
import { Parser, Player } from "../../utils/svga-lite";
import Page from "../../utils/Page";
import {
  // svgaSources,
  svgaLargeFiles,
  // posterFiles,
  getOneAtRandom,
} from "../../utils/constants";

const files = svgaLargeFiles;
const parser = new Parser();
let player;

Page({
  data: {
    url: "",
    current: 0,
  },

  bindEvents: {
    "#prevbtn:click": "handleSwitchPrev",
    "#nextbtn:click": "handleSwitchNext",
    // "#randbtn:click": "handleSwitchAtRandom"
  },

  observers: {
    url() {
      this.initialize();
    },
  },

  handleSwitchAtRandom() {
    const { ranIndex, url } = getOneAtRandom(files);

    this.setData({
      url,
      current: ranIndex,
    });
  },

  handleSwitchPrev() {
    const { current } = this.data;
    let prev = current - 1;

    if (prev < 0) {
      prev = files.length - 1;
    }

    player.playMode = "fallbacks";
    player.fillMode = "forwards";
    this.setData({
      url: files[prev],
      current: prev,
    });
  },

  handleSwitchNext() {
    const { current } = this.data;
    let next = current + 1;

    if (next > files.length - 1) {
      next = 0;
    }

    player.playMode = "forwards";
    player.fillMode = "backwards";
    this.setData({
      url: files[next],
      current: next,
    });
  },

  async initialize() {
    try {
      showPopup("准备下载资源");
      const videoItem = await parser.load(this.data.url);
      showPopup("下载资源成功");

      console.log(this.data.url, videoItem);
      await player.mount(videoItem);
      showPopup("资源装载成功");
      player.start();
      showPopup("");
    } catch (ex) {
      console.error("svga初始化失败！", ex);
      showPopup(ex.message + "\n" + ex.stack);
    }
  },

  async onLoad() {
    player = new Player({
      container: document.querySelector("#palette"),
      loop: 1,
      // playMode: "fallbacks",
      // fillMode: "forwards",
      // contentMode: "aspect-fill",
      // contentMode: "fill",
      // contentMode: "aspect-fit",
      contentMode: "center",
    });
    player.onProcess = (percent, frame) => {
      console.log("当前进度", percent, frame);
      console.log("---- UPDATE ----");
    };
    player.onEnd = () => {
      console.log("---- END ----");
    };
    // this.handleSwitchAtRandom();
    this.setData({
      current: 0,
      url: files[0],
    });
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
