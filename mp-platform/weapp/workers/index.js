import { unzlibSync } from "./fflate";

worker.onMessage((result) => {
  const { method, data } = result || {};

  if (typeof method === "string" && method !== "") {
    worker.postMessage({
      method,
      data: unzlibSync(new Uint8Array(data)).buffer,
    });
  }
});
