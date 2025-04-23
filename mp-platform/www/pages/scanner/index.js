import { Scanner, UserMedia } from 'fuck-scanner';

window.addEventListener("DOMContentLoaded", async () => {
  // 获取DOM元素
  const $video = document.getElementById("video-kit");
  const $container = document.querySelector(".container");
  const $result = document.getElementById("result");
  const $startBtn = document.getElementById("start-btn");
  const $stopBtn = document.getElementById("stop-btn");
  const $switchBtn = document.getElementById("switch-btn");
  
  // 初始化UserMedia
  const userMedia = new UserMedia($video);
  
  // 设置合适的分辨率
  userMedia.setResolution(1280, 720);
  
  // 初始化Scanner，设置扫描结果回调函数
  const scanner = new Scanner((results) => {
    if (results && results.length > 0) {
      // 显示扫描结果
      const resultList = results.map(result => `<li>${result.text}</li>`).join('');
      $result.innerHTML = `<ul>${resultList}</ul>`;
      
      // 可选：扫描到结果后自动停止扫描
      // scanner.stop();
    }
  }, 200); // 设置扫描间隔为200ms
  
  // 设置扫描配置（可选）
  scanner.setScanConfig({ gridSize: 3, overlap: 0.2 });
  
  // 设置视频元素
  scanner.setVideoElement($video);
  
  // 开始扫描按钮事件
  $startBtn.addEventListener("click", async () => {
    try {
      // 启动摄像头
      await userMedia.start();
      // 开始扫描
      scanner.start();
      $container.classList.add("scanning");
    } catch (error) {
      console.error("启动扫描失败:", error);
      alert("启动扫描失败: " + error.message);
    }
  });
  
  // 停止扫描按钮事件
  $stopBtn.addEventListener("click", () => {
    // 停止扫描
    scanner.stop();
    // 停止摄像头
    userMedia.stop();
    $container.classList.remove("scanning");
  });
  
  // 切换摄像头按钮事件
  $switchBtn.addEventListener("click", async () => {
    // 获取当前是否使用前置摄像头
    const isFront = $switchBtn.dataset.front === "true";
    // 切换摄像头
    userMedia.setFacingMode(!isFront);
    $switchBtn.dataset.front = (!isFront).toString();
    $switchBtn.textContent = !isFront ? "切换到后置摄像头" : "切换到前置摄像头";
    
    // 重新启动摄像头
    // 先停止当前的扫描和摄像头
    scanner.stop();
    userMedia.stop();
    // 然后重新启动
    await userMedia.start();
    scanner.start();
    $container.classList.add("scanning");
  });
  
  // 初始设置为后置摄像头
  $switchBtn.dataset.front = "false";
  $switchBtn.textContent = "切换到前置摄像头";
});
