export type RendererType = '2d' | 'webgl' | 'webgl2' | 'webgpu';

export interface RendererInfo {
  type: RendererType;
  name: string;
  supported: boolean;
  priority: number;
}
