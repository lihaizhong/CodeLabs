import { Parser, Poster } from "octopus-svga";
import { posterFiles } from "../../utils/constants";

async function generatePoster(point) {
  const data = posterFiles[point];
  const posterItem = await Parser.load(data.url);
  const { width, height } = posterItem.size;
  const poster = new Poster(width, height);

  data.modify?.(posterItem);
  console.log("posterItem", posterItem);
  await poster.mount(posterItem);

  const $elem = document.getElementById("poster");

  poster.setContentMode("aspect-fit");
  poster.draw();

  $elem.src = poster.toDataURL();
  console.log("data url", $elem.src);
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

    generatePoster(--current);
  });

  $nextBtn.addEventListener("click", async () => {
    if (current + 1 >= len) {
      return;
    }

    generatePoster(++current);
  });

  generatePoster(current);
});
