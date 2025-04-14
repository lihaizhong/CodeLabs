export function requestAnimationFrame(callback: FrameRequestCallback) {
  const currentTime = Date.now();
  const timeToCall = Math.max(0, 16 - (currentTime % 16));
  const id = window.setTimeout(function () {
    callback(currentTime + timeToCall);
  }, timeToCall);

  return id;
}

export function cancelAnimationFrame(id: number) {
  window.clearTimeout(id);
}
