import { MultiQRParser, QRCodeResult, SplitConfig } from "./media-parser";
import { Poll } from "./poll";
import { version } from "../package.json";

export class Scanner {
  /**
   * 媒体解析器
   */
  private mediaParser: MultiQRParser;
  /**
   * 轮询器
   */
  private poll: Poll;
  /**
   * 视频元素
   */
  private videoElement: HTMLVideoElement | null = null;
  /**
   * 图像元素
   */
  private imageElement: HTMLImageElement | null = null;
  /**
   * 扫描结果回调函数
   */
  private onResult: (results: QRCodeResult[]) => void;
  /**
   * 扫描配置
   */
  private scanConfig: SplitConfig = { gridSize: 2, overlap: 0.2 };
  /**
   * 版本号
   */
  public version: string = version;
  
  /**
   * 创建一个二维码轮询扫描器
   * @param onResult 扫描结果回调函数
   * @param interval 轮询间隔（毫秒），默认100ms
   */
  constructor(onResult: (results: QRCodeResult[]) => void, interval: number = 100) {
    this.mediaParser = new MultiQRParser();
    this.onResult = onResult;
    // 创建轮询器，每次轮询时执行扫描
    this.poll = new Poll(() => this.scan(), interval);
  }
  
  /**
   * 设置要扫描的视频元素
   * @param element HTML视频元素
   */
  setVideoElement(element: HTMLVideoElement): void {
    this.videoElement = element;
    this.imageElement = null; // 清除之前可能设置的图像元素
  }
  
  /**
   * 设置要扫描的图像元素
   * @param element HTML图像元素
   */
  setImageElement(element: HTMLImageElement): void {
    this.imageElement = element;
    this.videoElement = null; // 清除之前可能设置的视频元素
  }
  
  /**
   * 设置扫描配置
   * @param config 扫描配置
   */
  setScanConfig(config: SplitConfig): void {
    this.scanConfig = config;
  }
  
  /**
   * 设置轮询间隔
   * @param interval 轮询间隔（毫秒）
   */
  setInterval(interval: number): void {
    this.poll.setInterval(interval);
  }
  
  /**
   * 开始轮询扫描
   */
  start(): void {
    if (!this.videoElement && !this.imageElement) {
      console.error('请先设置视频或图像元素');
      return;
    }
    
    this.poll.start();
  }
  
  /**
   * 停止轮询扫描
   */
  stop(): void {
    this.poll.stop();
  }
  
  /**
   * 执行一次扫描
   * @returns 扫描结果
   */
  private scan(): void {
    try {
      let results: QRCodeResult[] = [];
      
      if (this.videoElement) {
        // 从视频帧中扫描
        results = this.mediaParser.parseFromVideoFrame(this.videoElement, this.scanConfig);
      } else if (this.imageElement) {
        // 从图像中扫描
        results = this.mediaParser.parseFromImage(this.imageElement, this.scanConfig);
      }
      
      // 调用结果回调
      if (results.length > 0) {
        this.onResult(results);
      }
    } catch (error) {
      console.error('扫描过程中出错:', error);
    }
  }
}
