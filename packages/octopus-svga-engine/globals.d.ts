declare const __VERSION__: string;

declare global {
  interface Navigator {
    gpu?: GPU;
  }

  interface GPU {
    requestAdapter(options?: GPURequestAdapterOptions): Promise<GPUAdapter | null>;
    getPreferredCanvasFormat(): GPUTextureFormat;
  }

  interface GPUAdapter {
    info: GPUAdapterInfo;
    requestDevice(descriptor?: GPUDeviceDescriptor): Promise<GPUDevice>;
  }

  interface GPUDeviceDescriptor {
    label?: string;
    requiredFeatures?: string[];
    requiredLimits?: Record<string, number>;
  }

  interface GPUAdapterInfo {
    description: string;
    vendor: string;
    architecture: string;
    device: string;
    featureName: string;
  }

  interface GPUCanvasContext {
    configure(configuration: GPUCanvasConfiguration): void;
    getCurrentTexture(): GPUTexture;
  }

  interface GPUCanvasConfiguration {
    device: GPUDevice;
    format: GPUTextureFormat;
    alphaMode: GPUCanvasAlphaMode;
  }

  interface GPUDevice {
    queue: GPUQueue;
    createShaderModule(descriptor: GPUShaderModuleDescriptor): GPUShaderModule;
    createRenderPipeline(descriptor: GPURenderPipelineDescriptor): GPURenderPipeline;
    createBuffer(descriptor: GPUBufferDescriptor): GPUBuffer;
    createTexture(descriptor: GPUTextureDescriptor): GPUTexture;
    createSampler(descriptor: GPUSamplerDescriptor): GPUSampler;
    createBindGroup(descriptor: GPUBindGroupDescriptor): GPUBindGroup;
    createCommandEncoder(options?: GPUCommandEncoderDescriptor): GPUCommandEncoder;
  }

  interface GPUCommandEncoder {
    beginRenderPass(descriptor: GPURenderPassDescriptor): GPURenderPassEncoder;
    finish(): GPUCommandBuffer;
  }

  interface GPURenderPassEncoder {
    setBindGroup(index: number, bindGroup: GPUBindGroup): void;
    setPipeline(pipeline: GPURenderPipeline): void;
    setVertexBuffer(slot: number, buffer: GPUBuffer | null, offset?: number, size?: number): void;
    draw(vertexCount: number, instanceCount?: number, firstVertex?: number, firstInstance?: number): void;
    end(): void;
  }

  interface GPUCommandBuffer {}

  interface GPUQueue {
    writeTexture(destination: GPUImageCopyTexture, data: any, dataLayout: GPUImageDataLayout, size: GPUExtent3D): void;
    writeBuffer(destination: GPUBuffer, data: any, offset?: number, size?: number): void;
    submit(commandBuffers: GPUCommandBuffer[]): void;
  }

  interface GPUShaderModule {}

  interface GPUTextureView {}

  interface GPURenderPipeline {
    getBindGroupLayout(index: number): GPUPipelineLayout;
  }

  interface GPUBuffer {
    getMappedRange(): ArrayBuffer;
    unmap(): void;
    destroy(): void;
  }

  interface GPUTexture {
    createView(descriptor?: GPUTextureViewDescriptor): GPUTextureView;
    destroy(): void;
  }

  interface GPUSampler {}

  interface GPUBindGroup {}

  interface GPUVertexBufferLayout {
    arrayStride: number;
    attributes: GPUVertexAttribute[];
  }

  interface GPUVertexAttribute {
    shaderLocation: number;
    offset: number;
    format: string;
  }

  interface GPURenderPipelineDescriptor {
    vertex: {
      module: GPUShaderModule;
      entryPoint: string;
      buffers?: GPUVertexBufferLayout[];
    };
    fragment: {
      module: GPUShaderModule;
      entryPoint: string;
      targets: GPUColorTargetState[];
    };
    primitive: {
      topology: GPUPrimitiveTopology;
    };
    layout: GPUPipelineLayout | string;
  }

  interface GPUColorTargetState {
    format: GPUTextureFormat;
    blend?: GPUBlendState;
  }

  interface GPUBlendState {
    color: GPUBlendComponent;
    alpha: GPUBlendComponent;
  }

  interface GPUBlendComponent {
    srcFactor: GPUBlendFactor;
    dstFactor: GPUBlendFactor;
    operation: GPUBlendOperation;
  }

  interface GPURequestAdapterOptions {
    powerPreference?: string;
    forceFallbackAdapter?: boolean;
  }

  type GPUPrimitiveTopology = "point-list" | "line-list" | "line-strip" | "triangle-list" | "triangle-strip";

  type GPUBlendFactor = "zero" | "one" | "src-alpha" | "one-minus-src-alpha" | "dst-alpha" | "one-minus-dst-alpha";

  type GPUBlendOperation = "add" | "subtract" | "reverse-subtract" | "min" | "max";

  type GPUCanvasAlphaMode = "opaque" | "premultiplied";

  type GPUTextureFormat = string;

  type GPUPipelineLayout = any;

  interface GPUDeviceDescriptor {
    label?: string;
    requiredFeatures?: string[];
    requiredLimits?: Record<string, number>;
  }

  interface GPUBufferDescriptor {
    size: number;
    usage: number;
    mappedAtCreation?: boolean;
  }

  interface GPUTextureDescriptor {
    size: GPUExtent3D;
    format: string;
    usage: number;
  }

  interface GPUSamplerDescriptor {
    magFilter?: string;
    minFilter?: string;
    addressModeU?: string;
    addressModeV?: string;
  }

  interface GPUBindGroupDescriptor {
    layout: GPUPipelineLayout;
    entries: GPUBindGroupEntry[];
  }

  interface GPUCommandEncoderDescriptor {
    label?: string;
  }

  interface GPUShaderModuleDescriptor {
    code: string;
  }

  interface GPURenderPassDescriptor {
    colorAttachments: GPURenderPassColorAttachment[];
  }

  interface GPUTextureViewDescriptor {
    format?: string;
    dimension?: string;
    aspect?: string;
    baseMipLevel?: number;
    mipLevelCount?: number;
    baseArrayLayer?: number;
    arrayLayerCount?: number;
  }

  interface GPUImageCopyTexture {
    texture: GPUTexture;
    mipLevel?: number;
    origin?: GPUOrigin3D;
    aspect?: string;
  }

  interface GPUImageDataLayout {
    offset?: number;
    bytesPerRow?: number;
    rowsPerImage?: number;
  }

  interface GPUExtent3D {
    width: number;
    height?: number;
    depthOrArrayLayers?: number;
  }

  interface GPUOrigin3D {
    x?: number;
    y?: number;
    z?: number;
  }

  interface GPUBindGroupEntry {
    binding: number;
    resource: GPUBindingResource;
  }

  interface GPUBindingResource {
    buffer?: GPUBuffer;
    sampler?: GPUSampler;
    texture?: GPUTextureView;
  }

  interface GPURenderPassColorAttachment {
    view: GPUTextureView;
    clearValue: GPUColor;
    loadOp: string;
    storeOp: string;
  }

  interface GPUColor {
    r: number;
    g: number;
    b: number;
    a: number;
  }

  // WebGPU enums
  const GPUTextureUsage = {
    COPY_SRC: 0x01,
    COPY_DST: 0x02,
    TEXTURE_BINDING: 0x04,
    STORAGE_BINDING: 0x08,
    RENDER_ATTACHMENT: 0x10,
  } as const;

  const GPUBufferUsage = {
    MAP_READ: 0x01,
    MAP_WRITE: 0x02,
    COPY_SRC: 0x04,
    COPY_DST: 0x08,
    INDEX: 0x10,
    VERTEX: 0x20,
    UNIFORM: 0x40,
    STORAGE: 0x80,
    INDIRECT: 0x100,
  } as const;
}
