export class UserMedia {
  /**
   * 媒体流
   */
  private stream: MediaStream | null = null;
  /**
   * 视频元素
   */
  private videoElement: HTMLVideoElement;
  /**
   * 媒体约束条件
   */
  private constraints: MediaStreamConstraints = {
    video: {
      facingMode: 'environment', // 默认使用后置摄像头
      width: { ideal: 1280 },
      height: { ideal: 720 }
    },
    audio: false
  };

  /**
   * 创建一个用户媒体管理器
   * @param videoElement 视频元素
   */
  constructor(videoElement: HTMLVideoElement) {
    this.videoElement = videoElement;
  }

  /**
   * 设置使用前置或后置摄像头
   * @param useFront 是否使用前置摄像头
   */
  setFacingMode(useFront: boolean): void {
    if (!this.constraints.video || typeof this.constraints.video === 'boolean') {
      this.constraints.video = {};
    }
    
    if (typeof this.constraints.video === 'object') {
      this.constraints.video.facingMode = useFront ? 'user' : 'environment';
    }
  }

  /**
   * 设置视频分辨率
   * @param width 宽度
   * @param height 高度
   */
  setResolution(width: number, height: number): void {
    if (!this.constraints.video || typeof this.constraints.video === 'boolean') {
      this.constraints.video = {};
    }
    
    if (typeof this.constraints.video === 'object') {
      this.constraints.video.width = { ideal: width };
      this.constraints.video.height = { ideal: height };
    }
  }

  /**
   * 启动摄像头并播放视频
   * @returns Promise<MediaStream> 媒体流
   */
  async start(): Promise<MediaStream> {
    try {
      // 检查浏览器是否支持getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('浏览器不支持 getUserMedia API');
      }

      // 如果已经有流，先停止
      if (this.stream) {
        this.stop();
      }

      // 获取媒体流
      this.stream = await navigator.mediaDevices.getUserMedia(this.constraints);
      
      // 绑定到视频元素
      this.attachStreamToVideo();
      
      return this.stream;
    } catch (error) {
      console.error('获取摄像头失败:', error);
      throw error;
    }
  }

  /**
   * 停止摄像头
   */
  stop(): void {
    if (this.stream) {
      // 停止所有轨道
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
      
      // 清除视频源
      if (this.videoElement) {
        this.videoElement.srcObject = null;
      }
    }
  }

  /**
   * 切换摄像头（前置/后置）
   * @returns Promise<MediaStream> 新的媒体流
   */
  async switchCamera(): Promise<MediaStream> {
    if (!this.constraints.video || typeof this.constraints.video === 'boolean') {
      this.constraints.video = {};
    }
    
    if (typeof this.constraints.video === 'object') {
      // 切换摄像头方向
      const currentFacingMode = this.constraints.video.facingMode;

      this.constraints.video.facingMode = 
        currentFacingMode === 'user' ? 'environment' : 'user';
    }
    
    // 重新启动摄像头
    return this.start();
  }

  /**
   * 获取当前媒体流
   * @returns MediaStream | null 当前媒体流
   */
  getStream(): MediaStream | null {
    return this.stream;
  }

  /**
   * 获取视频轨道的能力信息
   * @returns MediaTrackCapabilities | null 能力信息
   */
  getCapabilities(): MediaTrackCapabilities | null {
    if (this.stream) {
      const videoTrack = this.stream.getVideoTracks()[0];

      if (videoTrack && 'getCapabilities' in videoTrack) {
        return videoTrack.getCapabilities();
      }
    }

    return null;
  }

  /**
   * 获取可用的媒体设备列表
   * @returns Promise<MediaDeviceInfo[]> 设备列表
   */
  static async getDevices(): Promise<MediaDeviceInfo[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();

      return devices.filter(device => device.kind === 'videoinput');
    } catch (error) {
      console.error('获取设备列表失败:', error);
      throw error;
    }
  }

  /**
   * 将流绑定到视频元素
   * @private
   */
  private attachStreamToVideo(): void {
    if (this.videoElement && this.stream) {
      this.videoElement.srcObject = this.stream;
      this.videoElement.onloadedmetadata = () => {
        this.videoElement.play().catch(error => {
          console.error('视频播放失败:', error);
        });
      };
    }
  }
}
