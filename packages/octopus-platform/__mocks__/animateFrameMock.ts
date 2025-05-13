export function requestAnimationFrame(callback: FrameRequestCallback) {
  return setTimeout(callback, Math.max(0, 16 - (Date.now() % 16)));
}

export function cancelAnimationFrame(rafId: number) {
  clearTimeout(rafId);
}
