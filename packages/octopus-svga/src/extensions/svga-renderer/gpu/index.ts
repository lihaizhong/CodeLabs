import type { Bitmap, PlatformCanvas, PlatformOffscreenCanvas } from "octopus-platform";
import { RendererGPU } from "./RendererGPU";

// WebGPU 类型占位符（从 globals.d.ts 迁移）
type GPUDevice = any;
type GPUShaderModule = any;
type GPURenderPipeline = any;
type GPUCanvasContext = any;

// 扩展 Navigator 接口以支持 WebGPU
declare global {
  interface Navigator {
    gpu?: {
      requestAdapter(): Promise<any>;
      getPreferredCanvasFormat(): string;
    };
  }
}

export interface GPURendererOptions {
  gpuDevice: GPUDevice;
  canvas?: HTMLCanvasElement;
}

export const createGPURenderer = async ({ gpuDevice, canvas }: GPURendererOptions): Promise<RendererGPU | null> => {
  return new RendererGPU(gpuDevice, canvas);
};

export const detectGPUSupport = async (): Promise<{
  webgpu: boolean;
  adapterInfo: {
    description: string;
    vendor: string;
    architecture: string;
    device: string;
    featureName: string;
  } | null;
}> => {
  if (!('gpu' in navigator) || typeof navigator.gpu === 'undefined') {
    return {
      webgpu: false,
      adapterInfo: null
    };
  }

  try {
    const adapter = await navigator.gpu.requestAdapter();

    return {
      webgpu: true,
      adapterInfo: adapter?.info || null
    };
  } catch (error) {
    return {
      webgpu: false,
      adapterInfo: null
    };
  }
};

export interface GPUShader {
  module: GPUShaderModule;
  pipeline: GPURenderPipeline;
}

export const RendererGPUExtension = {
  stick:
    async (
      device: GPUDevice,
      bitmap: Bitmap
    ) => {
      const texture = device.createTexture({
        size: { width: bitmap.width, height: bitmap.height },
        format: "rgba8unorm",
        usage: 0x04 | 0x02 // TEXTURE_BINDING | COPY_DST
      });

      device.queue.writeTexture(
        { texture },
        bitmap,
        { bytesPerRow: bitmap.width * 4 },
        { width: bitmap.width, height: bitmap.height }
      );

      return texture;
    },
  clear: (
    type: "CL" | "RE",
    device: GPUDevice,
    context: GPUCanvasContext,
    canvas: PlatformCanvas | PlatformOffscreenCanvas,
    width: number,
    height: number
  ) => {
    if (type === "CL") {
      return () => {
        const commandEncoder = device.createCommandEncoder();
        const passEncoder = commandEncoder.beginRenderPass({
          colorAttachments: [
            {
              view: context.getCurrentTexture().createView(),
              clearValue: { r: 0, g: 0, b: 0, a: 0 },
              loadOp: "clear",
              storeOp: "store"
            }
          ]
        });
        passEncoder.end();
        device.queue.submit([commandEncoder.finish()]);
      };
    }

    return () => {
      (canvas as HTMLCanvasElement).width = width;
      (canvas as HTMLCanvasElement).height = height;
      context.configure({
        device,
        format: navigator.gpu!.getPreferredCanvasFormat(),
        alphaMode: "opaque",
      });
    };
  },
};

export { RendererGPU };