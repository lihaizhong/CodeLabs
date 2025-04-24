import "weui";
import { Parser, platform } from "octopus-svga";
import { posterFiles } from "../../utils/constants";

const files = posterFiles;
const parser = new Parser();

async function render(current) {
  const url = files[current];
  const videoItem = await parser.load(url);
  const $infos = document.getElementById("js-animate-infos");
  const $switch = document.getElementById("js-animate-switch");
  const infos = [
    ["动画名称", videoItem.filename],
    ["版本号", videoItem.version],
    ["动画尺寸", `${videoItem.size.width} x ${videoItem.size.height}`],
    ["动画帧数", videoItem.frames],
    ["动画帧率", videoItem.fps],
  ]

  $infos.innerHTML = "";
  for (const [key, value] of infos) {
    const $item = document.createElement("div");

    $item.classList.add("weui-cell", "weui-cell_active");
    $item.innerHTML = `
      <div class="weui-cell__bd">${key}</div>
      <div class="weui-cell__ft">${value}</div>
    `;

    $infos.appendChild($item);
  }

  $switch.innerHTML = "";
  Object.entries(videoItem.images).forEach(([key, value], index) => {
    const $item = document.createElement("div");
    const b64Image = platform.decode.toDataURL(value);
    const image = new Image();

    image.src = b64Image;
    image.onload = () => {
      $item.classList.add("weui-cell", "weui-cell_access");
      $item.innerHTML = `
        <div class="weui-cell__bd">${key}</div>
        <div class="weui-cell__ft">${image.width} x ${image.height}</div>
      `;
      $item.addEventListener("click", () => {
        $switch.querySelector(".weui-cell_active").classList.remove("weui-cell_active");
        $item.classList.add("weui-cell_active");
        document.getElementById("analyze-stage").src = b64Image;
        document.getElementById(
          "analyze-half-screen-dialog-close"
        ).click();
      });

      $switch.appendChild($item);

      if (index === 0) {
        $item.click();
      } 
    }
  });
}

function toggleHalfScreenDialog() {
  const $operateBtn = document.getElementById("oper-btn");
  const $analyzeHalfScreenDialog = document.getElementById("analyze-half-screen-dialog");
  const $analyzeHalfScreenDialogCloseBtn = document.getElementById(
    "analyze-half-screen-dialog-close"
  );

  $operateBtn.addEventListener("click", () => {
    $analyzeHalfScreenDialog.classList.add("weui-half-screen-dialog_show");
  });
  $analyzeHalfScreenDialogCloseBtn.addEventListener("click", () => {
    $analyzeHalfScreenDialog.classList.remove("weui-half-screen-dialog_show");
  });
}

window.addEventListener("DOMContentLoaded", () => {
  const $prevBtn = document.getElementById("prev-btn");
  const $nextBtn = document.getElementById("next-btn");
  let current = 0;

  $prevBtn.addEventListener("click", () => {
    if (current - 1 < 0) {
      return;
    }

    render(--current);
  });
  $nextBtn.addEventListener("click", () => {
    if (current + 1 >= posterFiles.length) {
      return;
    }

    render(++current);
  });

  toggleHalfScreenDialog();
  render(current);
});
