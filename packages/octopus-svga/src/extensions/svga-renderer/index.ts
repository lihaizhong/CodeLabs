import { PlatformCanvas } from 'octopus-platform';
import { createGPURenderer,RendererGPU } from './gpu';
import { createGLRenderer,RendererGL } from './gl';
import { create2DRenderer,Renderer2D } from './2d';
import { PlatformRenderingContext2D } from '../../types';

export * from './2d'
export * from './gl'
export * from './gpu'

export type RendererType = '2d' | 'webgl' | 'webgl2' | 'webgpu';

export interface RendererInfo {
  type: RendererType;
  name: string;
  supported: boolean;
  priority: number;
}

const rendererInfo: RendererInfo[] = [
  { type: 'webgpu', name: 'WebGPU', supported: false, priority: 3 },
  { type: 'webgl', name: 'WebGL', supported: false, priority: 2 },
  { type: '2d', name: 'Canvas 2D', supported: false, priority: 1 }
];

export const detectRendererSupport = async (): Promise<RendererInfo[]> => {
  // Check WebGPU support
  if ('gpu' in navigator) {
    try {
      // @ts-ignore
      const adapter = await navigator.gpu.requestAdapter();
      if (adapter) {
        rendererInfo[0].supported = true;
      }
    } catch (error) {
      // WebGPU not supported or failed to initialize
    }
  }

  // Check WebGL support
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      rendererInfo[1].supported = true;
    }
  } catch (error) {
    // WebGL not supported
  }

  // Check Canvas 2D support
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      rendererInfo[2].supported = true;
    }
  } catch (error) {
    // Canvas 2D not supported
  }

  return rendererInfo.sort((a, b) => b.priority - a.priority);
};

export async function createRenderer(
  type: "2d", 
  canvas?: PlatformCanvas, 
  context?: PlatformRenderingContext2D
): Promise<Renderer2D | null>
export async function createRenderer(
  type: "webgl" | "webgl2", 
  canvas?: PlatformCanvas, 
  glContext?: WebGLRenderingContext
): Promise<RendererGL | null>
export async function createRenderer(
  type: "webgpu", 
  canvas?: PlatformCanvas, 
  gpuDevice?: any
): Promise<RendererGPU | null>
export async function createRenderer(
  type: RendererType, 
  canvas?: PlatformCanvas, 
  context?: any
): Promise<Renderer2D | RendererGL | RendererGPU | null> {
  switch (type) {
    case 'webgpu':
      if (canvas && context) {
        return await createGPURenderer({ canvas, gpuDevice: context });
      }
      break;
    case 'webgl':
    case 'webgl2':
      if (context) {
        return createGLRenderer({ glContext: context });
      }
      break;
    case '2d':
      if (context) {
        return create2DRenderer({ context });
      }
      break;
  }
  return null;
}

export const createBestRenderer = async (
  canvas?: PlatformCanvas, 
  context?: any
): Promise<{ type: RendererType; renderer: Renderer2D | RendererGL | RendererGPU | null } | null> => {
  const supportInfo = await detectRendererSupport();
  
  for (const info of supportInfo) {
    if (!info.supported) continue;

    let renderer: Renderer2D | RendererGL | RendererGPU | null = null;
    
    switch (info.type) {
      case 'webgpu':
        if (canvas && context) {
          renderer = await createGPURenderer({ canvas, gpuDevice: context });
        }
        break;
      case 'webgl':
      case 'webgl2':
        if (context) {
          renderer = createGLRenderer({ glContext: context });
        }
        break;
      case '2d':
        if (context) {
          renderer = create2DRenderer({ context });
        }
        break;
    }
    
    if (renderer) {
      return { type: info.type, renderer };
    }
  }
  
  return null;
};
