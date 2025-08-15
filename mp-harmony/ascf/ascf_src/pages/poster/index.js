import { posterSources, getOneAtRandom } from "../../utils/constants";

Page({
  data: {
    sources: [posterSources][0],
    current: 0,
  },

  handleSwitchAtRandom() {
    const { sources } = this.data;
    const { ranIndex } = getOneAtRandom(sources.length);

    this.setData({ current: ranIndex });
  },

  handleSwitchPrev() {
    const { current, sources } = this.data;
    let prev = current - 1;

    if (prev < 0) {
      prev = sources.length - 1;
    }

    this.setData({ current: prev });
  },

  handleSwitchNext() {
    const { current, sources } = this.data;
    let next = current + 1;

    if (next > sources.length - 1) {
      next = 0;
    }

    this.setData({ current: next });
  },
});
