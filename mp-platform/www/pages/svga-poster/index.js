import "weui";
import {
  Parser,
  Poster,
  VideoEditor,
  getDataURLFromImageData,
} from "octopus-svga";
import { benchmark } from "octopus-benchmark";
import { EMPTY_PLACEHOLDER, posterSources } from "../../utils/constants";

const posterFiles = posterSources;

function resetImage() {
  document.getElementById("poster").src = EMPTY_PLACEHOLDER;
}

async function generatePoster(point) {
  const $elem = document.getElementById("poster");
  const data = posterFiles[point];
  let posterItem;

  if (typeof data === "string") {
    posterItem = await Parser.load(data);
  } else {
    posterItem = await Parser.load(data.url);
  }

  const { width, height } = posterItem.size;
  const poster = new Poster(width, height);

  if (typeof data === "object" && data !== null) {
    const videoEditor = new VideoEditor(
      poster.painter,
      poster.resource,
      posterItem,
    );

    await Promise.all(
      Object.keys(data.replace).map((key) =>
        videoEditor.setImage(key, data.replace[key]),
      ),
    );
  }

  benchmark.log("poster item", posterItem);
  await poster.mount(posterItem);

  poster.setContentMode("aspect-fit");
  poster.draw();

  const imageData = poster.toImageData();

  $elem.src = getDataURLFromImageData(imageData);
  benchmark.log("data url", $elem.src);
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

    resetImage();
    generatePoster(--current);
  });

  $nextBtn.addEventListener("click", async () => {
    if (current + 1 >= len) {
      return;
    }

    resetImage();
    generatePoster(++current);
  });

  resetImage();
  generatePoster(current);
});
