const LOCAL_SVGA_URL = "http://192.168.1.27:3536/svga";
const REMOTE_SVGA_URL = 'https://assets.2dfire.com/frontend';

export const svgaSources = [
  "9ce0cce7205fbebba380ed44879e5660.svga",
  "1ddb590515d196f07c411794633e4406.svga",
  "9a96c2c0fbe8ec39f0a192e3e1303d22.svga",
  "c4b3c4f8a05070352e036e869fc58b2f.svga",
  "a14788e60808428413f2b5cf984864b4.svga",
  "53266274807cd8e715c1433de8f400e9.svga",
  "95c40b88e02b1947a745fafaebf28fad.svga",
  "c78088a384285e18d9e9e38299b49e28.svga",
  "4e3768eb16c3ea7bafea3d75f1ff61e0.svga",
  "c06ba39b86a51fef584b4324d5511b8e.svga",
  "58f182116152001e79df1c0c78229e3b.svga",
  "5104feee82c9877c6e297f961010b5b7.svga",
  "6941a7b097a9e0b7bcdc4556c784e9e8.svga",
  "6481dcd75c34604731f1b2e77c02ece7.svga",
  "825015b9418620078ed09fece72d2b9c.svga",
  "ba8d3752c99154d7aa25f8e959cbd102.svga",
  "582d3f48ce07aaf5f12462ec34184021.svga",
  "24b50bd34845b070d051053e9814a658.svga",
  "cae7dd790cc423100372bb8b9de4064f.svga",
  "446179f5d94dd92165e24122f6ee0e13.svga",
  "3af554cafda2c7be95953c661e3a5d8f.svga",
  "a505eba87fabb8988ac920bb4b265cdc.svga",
  "567b81b194546668bb32f783ecae0902.svga",
  "4b3213a4df25d397786016b1bf0e0c01.svga",
  "88bcb99b38a0367866e646db9439437c.svga",
  "a7789d4a7b6e1d88e3a3a451b60eb2a0.svga",
  "ec33f22852725891476961fb62512f0c.svga",
  "0c4ba4b393af35bd0e030f08f48bc5c6.svga",
  "e5466a98c43cef9fae1151d8cf0a4269.svga",
  "56d381d396d5319c80492d2bc77c6fa5.svga",
  "34f8221e7b8a50cb562d7e675deafeb9.svga",
  "059c107da06c599dc49340280bde2bba.svga",
  "73bb57f6697de3069c02d6d9a3f1da63.svga",
  "5048039becf37d1a6ba56256aaf6c5a4.svga",
  "004ffa6820b48816c1ca789a6645e4c8.svga",
  "f922b9de74d15bd2c87c1e4cde5173be.svga",
  "6b9c17410cf3d11732a230174fedc9ad.svga",
  "15895fb79f97705094de089db31f3010.svga",
  "e8e0420a1208962d5a81772bfeb42351.svga",
  "ed15d1b5000314b76016005b5b202b09.svga",
  "23990e59a42fc9977937879e118fccd3.svga",
  "f3f502aa447602ddf3ce08ef9ef58f51.svga",
  "2698b666a73b9f0088271219269d31d4.svga",
  "b5f2308f9afcca6bcbfb18f88f06251f.svga",
  "fea4ce9565e726e1f0f6d1a46f381fe3.svga",
  "870e733803774fd432acbfbd721c1d2c.svga",
  "97e422a1a6a53d12f8d1b01248ef8fae.svga",
  "02ad1a44da1f90ae0c310454637aa8d6.svga",
  "644c8278a0b4638747666c7ea169c337.svga",
  "e3f209a5b492fbbef27343b3a1ebc5dc.svga",
  "c0cb9c1bdcd67ad51f8c8237ae1f746d.svga",
  "46291021b61f2d677f06841b84a443ce.svga",
  "e5ed31cec6b576cd67df0271b69320aa.svga",
  "ad6d6a788bb88520f908bb0fe04a75ca.svga",
  "45eadf03bee2013daa407fd4b91e29f5.svga",
].map((filename) => `${REMOTE_SVGA_URL}/${filename}`);

export const svgaCustomSources = [
  {
    filename: "custom.svga",
    replace: {
      qrcode_001: "custom_qrcode_001.png",
      qrcode_002: "custom_qrcode_002.png",
      bj_001: "custom_bj_001.png",
      bj_002: "custom_bj_002.png",
    },
  },
  {
    filename: "replace_001.svga",
    replace: {
      qrcode_001: "replace_001.png",
    },
  },
  {
    filename: "replace_002.svga",
    replace: {
      qrcode_001: "replace_002.png",
    },
  },
].map((item) => {
  const { filename, replace } = item;

  return {
    filename,
    url: `${LOCAL_SVGA_URL}/custom/${filename}`,
    replace: Object.keys(replace).reduce((values, key) => {
      values[key] = `${LOCAL_SVGA_URL}/custom/${replace[key]}`;

      return values;
    }, {}),
  };
});

export const svgaLargeSources = [
  "frame00.svga",
  "frame01.svga",
  "frame02.svga",
  "frame03.svga",
].map((filename) => `${LOCAL_SVGA_URL}/large/${filename}`);

export const yySources = [
  "angel.svga",
  "EmptyState.svga",
  "halloween.svga",
  "HamburgerArrow.svga",
  "kingset.svga",
  "matteBitmap.svga",
  "matteRect.svga",
  "PinJump.svga",
  "posche.svga",
  "rose.svga",
  "TwitterHeart.svga",
  "Walkthrough.svga",
].map((filename) => `${LOCAL_SVGA_URL}/yy/${filename}`);

export const svgaHugeSources = [
  "frame01.svga",
  "frame02.svga",
  "frame03.svga",
].map((filename) => `${LOCAL_SVGA_URL}/huge/${filename}`);

export const posterSources = [
  "微信认证授权码-纯净版.svga",
  "微信认证授权码.svga",
  "支付宝认证授权码-纯净版.svga",
  "支付宝认证授权码.svga"
].map((filename) => `${LOCAL_SVGA_URL}/poster/${filename}`);

export function getOneAtRandom(size) {
  return {
    ranIndex: Math.floor(Math.random() * size),
  };
}
