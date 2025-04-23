import { Parser, Poster } from "octopus-svga";
import { posterFiles } from "../../utils/constants";

const parser = new Parser();

window.addEventListener("DOMContentLoaded", async () => {
  const posterItem = await parser.load(posterFiles[0]);
  const { width, height } = posterItem.size;
  const poster = new Poster(width, height);

  // poster.setConfig();
  console.log("posterItem", posterItem);
  await poster.mount(posterItem);

  const $elem = document.createElement("img");

  poster.setContentMode("aspect-fit");
  poster.draw();

  $elem.src = poster.toDataURL();
  $elem.style.width = "100%";
  console.log("data url", $elem.src);
  document.body.appendChild($elem);
});
