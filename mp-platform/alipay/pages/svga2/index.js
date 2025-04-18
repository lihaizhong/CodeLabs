import { svgaSources, getOneAtRandom } from "../../utils/constants";

const sources = svgaSources

Page({
  data: {
    url: "",
    current: 0,
  },

  onLoad() {
    // this.handleSwitchAtRandom();
    const current = 0;

    this.setData({
      current,
      url: sources[current]
    })
  },

  handleSwitchAtRandom() {
    const { ranIndex, url } = getOneAtRandom();

    this.setData({
      url,
      current: ranIndex,
    });
  },
  handleSwitchPrev() {
    const { current } = this.data;
    let prev = current - 1;

    if (prev < 0) {
      prev = sources.length - 1;
    }

    this.setData({
      url: sources[prev],
      current: prev,
    });
  },
  handleSwitchNext() {
    const { current } = this.data;
    let next = current + 1;

    if (next > sources.length - 1) {
      next = 0;
    }

    this.setData({
      url: sources[next],
      current: next,
    });
  },
});
