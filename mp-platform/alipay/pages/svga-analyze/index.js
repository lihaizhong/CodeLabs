import { unzlibSync } from "../../utils/fflate";
import { SVGADecoder } from "../../utils/fuck-svga";
import { getOneAtRandom } from "../../utils/constants";

Page({
  data: {
    images: [],
    params: {
      width: 0,
      height: 0,
    },
  },

  onLoad() {
    const { url } = getOneAtRandom();

    // 测试svga解析
    my.request({
      url,
      dataType: "arraybuffer",
      success: (res) => {
        const header = new Uint8Array(res.data, 0, 4);
        const u8a = new Uint8Array(res.data);

        if (header.toString() === "80,75,3,4") {
          throw new Error("this parser only support version@2 of SVGA.");
        }

        const inflateData = unzlibSync(u8a);
        const movieData = SVGADecoder.decode(inflateData);

        console.log("movieData", movieData);

        const windowInfo = my.getWindowInfo();
        const images = [];
        const { viewBoxHeight, viewBoxWidth } = movieData.params;
        Object.keys(movieData.images).forEach((key) => {
          const data = movieData.images[key];
          const ab = data.buffer.slice(
            data.byteOffset,
            data.byteOffset + data.byteLength
          );
          images.push(
            `data:image/png;base64,${my.arrayBufferToBase64(ab)}`
              .replace(/[\r\n]/g, "")
              .replace(" ", "")
          );
        });
        this.setData({
          images,
          params: {
            width: windowInfo.screenWidth,
            height: viewBoxHeight * (windowInfo.screenWidth / viewBoxWidth),
          },
        });
      },
    });
  },
});
