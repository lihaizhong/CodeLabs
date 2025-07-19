import "weui";
import { generateImageFromCode } from "octopus-svga";
import { benchmark } from "octopus-benchmark";
import { createQrCodeImg } from "../../utils/qrcode";

function insertContainer(title, source, size, type = "img") {
  const $root = document.body;
  const $title = document.createElement("div");
  let $main;

  switch (type) {
    case "img":
      $main = document.createElement("img");
      $main.classList.add("qr-img");
      $main.style.width = `${size}px`;
      $main.style.height = `${size}px`;
      $main.src = source;
      break;
    case "html":
      $main = document.createElement("div");
      $main.classList.add("qr-img");
      $main.style.width = `${size}px`;
      $main.style.height = `${size}px`;
      $main.innerHTML = source;
      break;
    default:
      throw new Error(`not support type: ${type}`);
  }

  console.log(type, source);
  $title.classList.add("qr-img-title");
  $title.innerText = `---- ${title.toUpperCase()} ----`;
  $root.appendChild($title);
  $root.appendChild($main);
}

const QRCodeUtils = {
  getSize() {
    // return document.body.clientWidth * 0.6;
    return 258;
  },

  // --- insertQrCodeToGif

  insertQrCodeToGif(size) {
    benchmark.time("create qr-code image", () =>
      insertContainer("gif", createQrCodeImg("this is a test"), size)
    );
  },

  // --- insertQrCodeToPNG

  insertQrCodeToPNG(size) {
    benchmark.time("create image from qr-code", () =>
      insertContainer(
        "png",
        generateImageFromCode({
          code: "this is a test",
          size: 500,
        }),
        size
      )
    );
  },
};

window.onload = () => {
  const size = QRCodeUtils.getSize();

  setTimeout(() => {
    QRCodeUtils.insertQrCodeToGif(size);
  }, 0);
  setTimeout(() => {
    QRCodeUtils.insertQrCodeToPNG(size);
  }, 0);
};
