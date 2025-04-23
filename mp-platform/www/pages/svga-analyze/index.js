import "weui";

const sprites = new Map();
const fileInfo = {
  version: '',
  filename: '',
  size: {
    width: 0,
    height: 0,
  },
  fps: 0,
  frames: [],
};

window.addEventListener("DOMContentLoaded", () => {
  const $analyze = document.getElementById("analyze-stage");
  const $prevBtn = document.getElementById("prev-btn");
  const $nextBtn = document.getElementById("next-btn");
  const $operateBtn = document.getElementById("oper-btn");
  const $analyzeHalfScreenDialog = document.getElementById("analyze-half-screen-dialog");
  const $analyzeHalfScreenDialogCloseBtn = document.getElementById(
    "analyze-half-screen-dialog-close"
  );

  $prevBtn.addEventListener("click", () => {});
  $nextBtn.addEventListener("click", () => {});
  $operateBtn.addEventListener("click", () => {
    $analyzeHalfScreenDialog.classList.add("weui-half-screen-dialog_show");
  });
  $analyzeHalfScreenDialogCloseBtn.addEventListener("click", () => {
    $analyzeHalfScreenDialog.classList.remove("weui-half-screen-dialog_show");
  });
});
