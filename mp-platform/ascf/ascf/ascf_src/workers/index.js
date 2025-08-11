// import { unzlibSync } from "./fflate";
import { unzlibSync } from "./unzlib";

worker.onMessage((result) => {
  const { method, data } = result || {};

  if (typeof method === "string" && method !== "") {
    worker.postMessage({
      method,
      data: unzlibSync(new Uint8Array(data)).buffer,
    });
  }
});
