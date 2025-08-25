// import { unzlibSync } from "./fflate";
import { unzlibSync } from "./unzlib";

onmessage = (event) => {
  // Transferable 检测器
  if (event.data instanceof ArrayBuffer) {
    return;
  }

  const { method, data, ref } = event.data || {};

  if (typeof method === "string" && method !== "") {
    fetch(data || method, { priority: "low" }).then(async (response) => {
      if (response.ok) {
        const buff = await response.arrayBuffer();
        const { buffer } = unzlibSync(new Uint8Array(buff));

        if (ref) {
          ref.grow(buffer.byteLength);

          const u8a = new Uint8Array(ref);

          for (let i = 0; i < buffer.byteLength; i++) {
            Atomics.store(u8a, i, buffer[i]);
          }

          postMessage({ method, data: ref });
        } else {
          postMessage(
            {
              method,
              data: buffer,
            },
            [buffer],
          );
        }
      }
    });
  }
};
