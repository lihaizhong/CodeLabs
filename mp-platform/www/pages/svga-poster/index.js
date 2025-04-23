import "weui";
import { Parser, Poster, platform } from "octopus-svga";
import { posterFiles } from "../../utils/constants";

const parser = new Parser();

async function analyzeSpriteImages(url) {
  const $analyze = document.getElementById("analyze-container");

  const videoItem = await parser.load(url);

  $analyze.innerHTML = "";  
  for (const key in videoItem.images) {
    const image = videoItem.images[key];
    const $image = document.createElement("img");

    $image.src = platform.decode.toDataURL(image);
    $image.style.width = "100%";
    $image.style.objectFit = "scale-down";
    $analyze.appendChild($image);
  }
}

async function generatePoster(url) {
  const posterItem = await parser.load(url);
  const { width, height } = posterItem.size;
  const poster = new Poster(width, height);

  // poster.setConfig();
  console.log("posterItem", posterItem);
  await poster.mount(posterItem);

  const $elem = document.getElementById("poster");

  poster.setContentMode("aspect-fit");
  poster.draw();

  $elem.src = poster.toDataURL();
  console.log("data url", $elem.src);
  analyzeSpriteImages(url);
}

window.addEventListener("DOMContentLoaded", () => {
  const len = posterFiles.length;
  let current = 0;

  const $prevBtn = document.getElementById("prev-btn");
  const $nextBtn = document.getElementById("next-btn");

  $prevBtn.addEventListener("click", async () => {
    if (current - 1 < 0) {
      return;
    }

    generatePoster(posterFiles[--current]);
  });

  $nextBtn.addEventListener("click", async () => {
    if (current + 1 > len) {
      return;
    }

    generatePoster(posterFiles[++current]);
  });

  generatePoster(posterFiles[current]);
});
