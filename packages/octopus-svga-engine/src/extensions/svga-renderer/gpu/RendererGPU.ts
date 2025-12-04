import type { Bitmap } from "octopus-platform";
import {
  PlatformVideo,
  type TransformScale,
  PLAYER_CONTENT_MODE
} from "@/types";

export class RendererGPU {
  private device: any = null;
  private context: any = null;
  private canvas: HTMLCanvasElement | null = null;
  private pipeline: any = null;
  private vertexBuffer: any = null;
  private uniformBuffer: any = null;
  private textureCache: Map<string, any> = new Map();
  private sampler: any = null;
  private globalTransform?: PlatformVideo.Transform = undefined;
  private lastResizeKey = "";

  constructor(private gpuDevice: any, canvas?: HTMLCanvasElement) {
    this.canvas = canvas || null;
    this.initialize();
  }

  private async initialize(): Promise<void> {
    if (!this.gpuDevice || !this.canvas) return;
    
    this.device = this.gpuDevice;
    this.context = this.canvas.getContext('webgpu') as any;
    if (!this.context) return;

    await this.setupPipeline();
    this.setupBuffers();
    this.setupSampler();
  }

  private async setupPipeline(): Promise<void> {
    if (!this.device || !this.context) return;

    const canvasConfig: any = {
      device: this.device,
      format: navigator.gpu!.getPreferredCanvasFormat(),
      alphaMode: "opaque",
    };
    this.context.configure(canvasConfig);

    const shaderModule = this.device.createShaderModule({
      code: `
        struct VertexInput {
          @location(0) position: vec2<f32>,
          @location(1) texCoord: vec2<f32>,
          @location(2) color: vec4<f32>,
        };

        struct VertexOutput {
          @builtin(position) position: vec4<f32>,
          @location(0) texCoord: vec2<f32>,
          @location(1) color: vec4<f32>,
        };

        struct Uniforms {
          transform: mat3x3<f32>,
        };

        @group(0) @binding(0) var<uniform> uniforms: Uniforms;
        @group(0) @binding(1) var textureSampler: sampler;
        @group(0) @binding(2) var texture: texture_2d<f32>;

        @vertex
        fn vs_main(input: VertexInput) -> VertexOutput {
          var output: VertexOutput;
          let pos = uniforms.transform * vec3<f32>(input.position, 1.0);
          output.position = vec4<f32>(pos.xy, 0.0, 1.0);
          output.texCoord = input.texCoord;
          output.color = input.color;
          return output;
        }

        @fragment
        fn fs_main(input: VertexOutput) -> @location(0) vec4<f32> {
          let texColor = textureSample(texture, textureSampler, input.texCoord);
          return texColor * input.color;
        }
      `
    });

    const vertexBufferLayout: any[] = [
      {
        arrayStride: 8, // 2 floats * 4 bytes
        attributes: [
          {
            shaderLocation: 0,
            offset: 0,
            format: "float32x2"
          }
        ]
      },
      {
        arrayStride: 8, // 2 floats * 4 bytes
        attributes: [
          {
            shaderLocation: 1,
            offset: 0,
            format: "float32x2"
          }
        ]
      },
      {
        arrayStride: 16, // 4 floats * 4 bytes
        attributes: [
          {
            shaderLocation: 2,
            offset: 0,
            format: "float32x4"
          }
        ]
      }
    ];

    const pipelineDescriptor: any = {
      vertex: {
        module: shaderModule,
        entryPoint: "vs_main",
        buffers: vertexBufferLayout
      },
      fragment: {
        module: shaderModule,
        entryPoint: "fs_main",
        targets: [
          {
            format: navigator.gpu!.getPreferredCanvasFormat(),
            blend: {
              color: {
                srcFactor: "src-alpha",
                dstFactor: "one-minus-src-alpha",
                operation: "add"
              },
              alpha: {
                srcFactor: "src-alpha",
                dstFactor: "one-minus-src-alpha",
                operation: "add"
              }
            }
          }
        ]
      },
      primitive: {
        topology: "triangle-list"
      },
      layout: "auto"
    };

    this.pipeline = this.device.createRenderPipeline(pipelineDescriptor);
  }

  private setupBuffers(): void {
    if (!this.device) return;

    const vertices = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]);

    this.vertexBuffer = this.device.createBuffer({
      size: vertices.byteLength,
      usage: 0x20 | 0x08, // VERTEX | COPY_DST
      mappedAtCreation: true
    });

    new Float32Array(this.vertexBuffer.getMappedRange()).set(vertices);
    this.vertexBuffer.unmap();

    const uniformData = new Float32Array(9);
    this.uniformBuffer = this.device.createBuffer({
      size: uniformData.byteLength,
      usage: 0x40 | 0x08 // UNIFORM | COPY_DST
    });
  }

  private setupSampler(): void {
    if (!this.device) return;

    this.sampler = this.device.createSampler({
      magFilter: "linear",
      minFilter: "linear",
      addressModeU: "clamp-to-edge",
      addressModeV: "clamp-to-edge"
    });
  }

  private createTextureFromBitmap(bitmap: Bitmap): any {
    if (!this.device) return undefined;

    const texture = this.device.createTexture({
      size: { width: bitmap.width, height: bitmap.height },
      format: "rgba8unorm",
      usage: 0x04 | 0x02 // TEXTURE_BINDING | COPY_DST
    });

    this.device.queue.writeTexture(
      { texture },
      bitmap,
      { bytesPerRow: bitmap.width * 4 },
      { width: bitmap.width, height: bitmap.height }
    );

    return texture;
  }

  private createMatrix(transform: PlatformVideo.Transform): Float32Array {
    const { a, b, c, d, tx, ty } = transform;

    return new Float32Array([
      a, c, tx,
      b, d, ty,
      0, 0, 1
    ]);
  }

  private static calculateScale(
    contentMode: PLAYER_CONTENT_MODE,
    videoSize: PlatformVideo.VideoSize,
    canvasSize: { width: number; height: number }
  ): TransformScale {
    const imageRatio = videoSize.width / videoSize.height;
    const viewRatio = canvasSize.width / canvasSize.height;
    const isAspectFit = contentMode === PLAYER_CONTENT_MODE.ASPECT_FIT;
    const shouldUseWidth =
      (imageRatio >= viewRatio && isAspectFit) ||
      (imageRatio <= viewRatio && !isAspectFit);

    if (shouldUseWidth) {
      const scale = canvasSize.width / videoSize.width;
      return {
        scaleX: scale,
        scaleY: scale,
        translateX: 0,
        translateY: (canvasSize.height - videoSize.height * scale) / 2,
      };
    }

    const scale = canvasSize.height / videoSize.height;
    return {
      scaleX: scale,
      scaleY: scale,
      translateX: (canvasSize.width - videoSize.width * scale) / 2,
      translateY: 0,
    };
  }

  private drawRectangle(
    commandEncoder: any,
    passEncoder: any,
    x: number,
    y: number,
    width: number,
    height: number,
    transform: PlatformVideo.Transform,
    color: [number, number, number, number] = [1, 1, 1, 1]
  ): void {
    if (!this.device || !this.pipeline || !this.uniformBuffer || !this.vertexBuffer) return;

    const matrix = this.createMatrix(transform);
    this.device.queue.writeBuffer(this.uniformBuffer, 0, matrix.byteLength);

    const colorData = new Float32Array([
      ...color, ...color, ...color, ...color, ...color, ...color
    ]);

    const colorBuffer = this.device.createBuffer({
      size: colorData.byteLength,
      usage: 0x20 | 0x08 // VERTEX | COPY_DST
    });
    this.device.queue.writeBuffer(colorBuffer, 0, colorData.byteLength);

    const bindGroup = this.device.createBindGroup({
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.uniformBuffer } },
        { binding: 1, resource: this.sampler! },
        { binding: 2, resource: { buffer: this.vertexBuffer } }
      ]
    });

    passEncoder.setBindGroup(0, bindGroup);
    passEncoder.setPipeline(this.pipeline);

    const vertices = new Float32Array([
      x, y,
      x + width, y,
      x, y + height,
      x, y + height,
      x + width, y,
      x + width, y + height,
    ]);

    const vertexBuffer = this.device.createBuffer({
      size: vertices.byteLength,
      usage: 0x20 | 0x08, // VERTEX | COPY_DST
      mappedAtCreation: true
    });

    new Float32Array(vertexBuffer.getMappedRange()).set(vertices);
    vertexBuffer.unmap();

    passEncoder.setVertexBuffer(0, vertexBuffer);
    passEncoder.setVertexBuffer(1, this.vertexBuffer);
    passEncoder.setVertexBuffer(2, colorBuffer);
    
    passEncoder.draw(6);

    colorBuffer.destroy();
    vertexBuffer.destroy();
  }

  private drawEllipse(
    commandEncoder: any,
    passEncoder: any,
    x: number,
    y: number,
    radiusX: number,
    radiusY: number,
    transform: PlatformVideo.Transform,
    color: [number, number, number, number] = [1, 1, 1, 1]
  ): void {
    this.drawRectangle(
      commandEncoder,
      passEncoder,
      x - radiusX,
      y - radiusY,
      radiusX * 2,
      radiusY * 2,
      transform,
      color
    );
  }

  private drawShape(
    commandEncoder: any,
    passEncoder: any,
    shape: PlatformVideo.VideoFrameShape,
    globalTransform: PlatformVideo.Transform
  ): void {
    const { type, path, styles, transform } = shape;
    
    const combinedTransform = {
      a: transform.a * globalTransform.a + transform.c * globalTransform.b,
      b: transform.b * globalTransform.a + transform.d * globalTransform.b,
      c: transform.a * globalTransform.c + transform.c * globalTransform.d,
      d: transform.b * globalTransform.c + transform.d * globalTransform.d,
      tx: transform.tx * globalTransform.a + transform.ty * globalTransform.c + globalTransform.tx,
      ty: transform.tx * globalTransform.b + transform.ty * globalTransform.d + globalTransform.ty
    };

    const alpha = styles.fill ? parseFloat(styles.fill.split(',')[3]) : 1;
    const color: [number, number, number, number] = [1, 1, 1, alpha];

    switch (type) {
      case PlatformVideo.SHAPE_TYPE.RECT:
        this.drawRectangle(
          commandEncoder,
          passEncoder,
          path.x ?? 0,
          path.y ?? 0,
          path.width ?? 0,
          path.height ?? 0,
          combinedTransform,
          color
        );
        break;
      case PlatformVideo.SHAPE_TYPE.ELLIPSE:
        this.drawEllipse(
          commandEncoder,
          passEncoder,
          path.x ?? 0,
          path.y ?? 0,
          path.radiusX ?? 0,
          path.radiusY ?? 0,
          combinedTransform,
          color
        );
        break;
      case PlatformVideo.SHAPE_TYPE.SHAPE:
        break;
    }
  }

  private drawSprite(
    commandEncoder: any,
    passEncoder: any,
    frame: PlatformVideo.VideoFrame | PlatformVideo.HiddenVideoFrame,
    bitmap?: Bitmap,
    dynamicElement?: Bitmap,
    globalTransform?: PlatformVideo.Transform
  ): void {
    if ('alpha' in frame && frame.alpha === 0) return;

    const transform = globalTransform || { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };

    if (bitmap) {
      let texture = this.textureCache.get(bitmap as any);
      if (!texture) {
        texture = this.createTextureFromBitmap(bitmap);
        if (texture) {
          this.textureCache.set(bitmap as any, texture);
        }
      }

      if (texture && this.pipeline && this.uniformBuffer) {
        const bindGroup = this.device!.createBindGroup({
          layout: this.pipeline.getBindGroupLayout(0),
          entries: [
            { binding: 0, resource: { buffer: this.uniformBuffer } },
            { binding: 1, resource: this.sampler! },
            { binding: 2, resource: { texture: texture.createView() } }
          ]
        });

        passEncoder.setBindGroup(0, bindGroup);
        passEncoder.setPipeline(this.pipeline);

        const layout = (frame as PlatformVideo.VideoFrame).layout;
        this.drawRectangle(
          commandEncoder,
          passEncoder,
          0,
          0,
          layout.width,
          layout.height,
          transform,
          [1, 1, 1, frame.alpha || 1]
        );
      }
    }

    if ('shapes' in frame) {
      for (const shape of frame.shapes) {
        this.drawShape(commandEncoder, passEncoder, shape, transform);
      }
    }
  }

  public resize(
    contentMode: PLAYER_CONTENT_MODE,
    videoSize: PlatformVideo.VideoSize,
    canvasSize: { width: number; height: number }
  ): void {
    const { width: canvasWidth, height: canvasHeight } = canvasSize;
    const { width: videoWidth, height: videoHeight } = videoSize;
    const resizeKey = `${contentMode}-${videoWidth}-${videoHeight}-${canvasWidth}-${canvasHeight}`;

    if (this.lastResizeKey === resizeKey) {
      return;
    }

    let scale: TransformScale = {
      scaleX: 1,
      scaleY: 1,
      translateX: 0,
      translateY: 0,
    };

    if (contentMode === PLAYER_CONTENT_MODE.FILL) {
      scale.scaleX = canvasWidth / videoWidth;
      scale.scaleY = canvasHeight / videoHeight;
    } else {
      scale = RendererGPU.calculateScale(contentMode, videoSize, canvasSize);
    }

    this.lastResizeKey = resizeKey;
    this.globalTransform = {
      a: scale.scaleX,
      b: 0.0,
      c: 0.0,
      d: scale.scaleY,
      tx: scale.translateX,
      ty: scale.translateY,
    };
  }

  public render(
    videoEntity: PlatformVideo.Video,
    materials: Map<string, Bitmap>,
    dynamicMaterials: Map<string, Bitmap>,
    currentFrame: number,
    head: number,
    tail: number
  ): void {
    if (!this.device || !this.context || !this.pipeline) {
      console.warn('WebGPU not initialized');
      return;
    }

    const commandEncoder = this.device.createCommandEncoder();
    const passEncoder = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: this.context.getCurrentTexture().createView(),
          clearValue: { r: 0, g: 0, b: 0, a: 0 },
          loadOp: "clear",
          storeOp: "store"
        }
      ]
    });

    for (let i = head; i < tail; i++) {
      const sprite = videoEntity.sprites[i];
      const frame = sprite.frames[currentFrame];
      const bitmap = materials.get(sprite.imageKey);
      const dynamicElement = dynamicMaterials.get(sprite.imageKey);

      this.drawSprite(commandEncoder, passEncoder, frame, bitmap, dynamicElement, this.globalTransform);
    }

    passEncoder.end();
    this.device.queue.submit([commandEncoder.finish()]);
  }

  public destroy(): void {
    this.textureCache.forEach(texture => {
      texture.destroy();
    });
    this.textureCache.clear();

    if (this.vertexBuffer) this.vertexBuffer.destroy();
    if (this.uniformBuffer) this.uniformBuffer.destroy();

    this.device = null;
    this.context = null;
    this.canvas = null;
    this.pipeline = null;
    this.vertexBuffer = null;
    this.uniformBuffer = null;
    this.sampler = null;
    this.globalTransform = undefined;
    this.lastResizeKey = "";
  }
}
