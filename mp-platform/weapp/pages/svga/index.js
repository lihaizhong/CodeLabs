import { svgaSources, getOneAtRandom } from "../../utils/constants";

// const sources = [
//   'http://10.1.133.197:5151/svga/序列1.svga',
//   'http://10.1.133.197:5151/svga/序列2.svga',
//   'http://10.1.133.197:5151/svga/序列3.svga'
// ]
const sources = svgaSources

Page({
  data: {
    url: "",
    current: 0,
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
      prev = svgaSources.length - 1;
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

  onLoad() {
    this.handleSwitchAtRandom();
    // this.setData({
    //   current: 40,
    //   url: 'http://10.1.133.197:5151/svga/序列1.svga'
    // })
  },
});
