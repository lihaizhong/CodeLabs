import { svgaSources, svgaCustomSources, svgaLargeSources, svgaHugeSources, getOneAtRandom } from "../../utils/constants";

// const sources = [
//   'http://10.1.133.197:5151/svga/序列1.svga',
//   'http://10.1.133.197:5151/svga/序列2.svga',
//   'http://10.1.133.197:5151/svga/序列3.svga'
// ]
const sources = svgaCustomSources

Page({
  data: {
    source: "",
    current: 0,
  },

  handleSwitchAtRandom() {
    const { ranIndex, source } = getOneAtRandom();

    this.setData({
      source,
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
      source: sources[prev],
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
      source: sources[next],
      current: next,
    });
  },

  onLoad() {
    // this.handleSwitchAtRandom();
    const current = 0;

    this.setData({
      current,
      source: sources[current]
    })
  },
});
