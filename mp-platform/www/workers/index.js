import { unzlibSync } from "./fflate";

onmessage = (event) => {
  const { method, data } = event.data || {};

  if (typeof method === "string" && method !== "") {
    fetch(data || method).then(async (response) => {
      if (response.ok) {
        const buff = await response.arrayBuffer();
        const { buffer } = unzlibSync(new Uint8Array(buff));

        postMessage(
          {
            method,
            data: buffer,
          },
          [buffer]
        );
      }
    });
  }
};
