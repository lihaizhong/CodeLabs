window.addEventListener("DOMContentLoaded", () => {
  const $btn1 = document.getElementById("navigate-to-miniprogram-btn");
  const $btn2 = document.getElementById(
    "navigate-to-miniprogram-of-error-path-btn"
  );
  
  $btn1.addEventListener("click", () => {
    wx.miniProgram.navigateTo({
      url: "/pages/index/index",
    });
  });
  
  $btn2.addEventListener("click", () => {
    wx.miniProgram.navigateTo({
      url: "/pages/index",
    });
  });
  
})