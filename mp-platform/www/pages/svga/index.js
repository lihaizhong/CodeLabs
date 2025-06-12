import { Parser, Player } from "octopus-svga";
import Page from "../../utils/Page";
import {
  svgaSources,
  svgaLargeSources,
  yySources,
  getOneAtRandom,
} from "../../utils/constants";

const files = [svgaSources, svgaLargeSources, yySources][2];
const parser = new Parser();
const player = new Player();
let videoItem;
let lastStatus = "next";

Page({
  data: {
    url: "",
    current: 0,
  },

  bindEvents: {
    "#prevbtn:click": "handleSwitchPrev",
    "#nextbtn:click": "handleSwitchNext",
    "#trybtn:click": "handleSwitchAtRandom",
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
    let prev;

    if (lastStatus === "next") {
      prev = current;
      lastStatus = "prev";
    } else {
      prev = current - 1;

      if (prev < 0) {
        prev = files.length - 1;
      }
    }

    player.setItem("playMode", "fallbacks");
    player.setItem("fillMode", "forwards");
    this.setData({
      url: files[prev],
      current: prev,
    });
  },

  handleSwitchNext() {
    const { current } = this.data;
    let next;

    if (lastStatus === "prev") {
      next = current;
      lastStatus = "next";
    } else {
      next = current + 1;

      if (next > files.length - 1) {
        next = 0;
      }
    }

    player.setItem("playMode", "forwards");
    player.setItem("fillMode", "backwards");
    this.setData({
      url: files[next],
      current: next,
    });
  },

  async initialize() {
    try {
      showPopup("准备下载资源");
      videoItem = await parser.load(this.data.url);
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
    await player.setConfig({
      container: "#palette",
      loop: 1,
      // playMode: "fallbacks",
      // fillMode: "forwards",
      // contentMode: "aspect-fill",
      // contentMode: "fill",
      contentMode: "aspect-fit",
      // contentMode: "center",
    });

    let loopStartTime;
    let startTime;
    player.onStart = () => {
      startTime = loopStartTime = performance.now();
      console.log(
        "---- START ----",
        "每帧期望消耗时长",
        1000 / videoItem.fps,
        "预期总消耗时长",
        (videoItem.frames / videoItem.fps) * 1000
      );
    };
    player.onProcess = (percent, frame) => {
      let loopEndTime = performance.now();

      console.log(
        "当前进度",
        percent,
        "当前帧数",
        frame,
        "持续时间",
        loopEndTime - loopStartTime
      );
      console.log("---- UPDATE ----");

      loopStartTime = loopEndTime;
    };
    player.onEnd = () => {
      console.log("---- END ----", "总消耗时间", performance.now() - startTime);
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
