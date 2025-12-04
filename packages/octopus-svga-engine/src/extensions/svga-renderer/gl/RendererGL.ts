import type { Bitmap } from "octopus-platform";
import {
  PlatformVideo,
  type TransformScale,
  PLAYER_CONTENT_MODE
} from "../../../types";

export class RendererGL {
  private gl: WebGLRenderingContext | null = null;
  private shaderProgram: WebGLProgram | null = null;
  private positionBuffer: WebGLBuffer | null = null;
  private texCoordBuffer: WebGLBuffer | null = null;
  private vertexBuffer: WebGLBuffer | null = null;
  private colorBuffer: WebGLBuffer | null = null;
  private textureCache: Map<string, WebGLTexture> = new Map();
  private globalTransform?: PlatformVideo.Transform = undefined;
  private lastResizeKey = "";

  constructor(private glContext: WebGLRenderingContext | null) {
    this.initialize();
  }

  private initialize(): void {
    if (!this.glContext) return;
    
    this.gl = this.glContext;
    this.setupShaders();
    this.setupBuffers();
    this.setupAttributes();
  }

  private setupShaders(): void {
    if (!this.gl) return;

    const vertexShaderSource = `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      attribute vec4 a_color;
      
      uniform mat3 u_matrix;
      
      varying vec2 v_texCoord;
      varying vec4 v_color;
      
      void main() {
        vec3 position = u_matrix * vec3(a_position, 1.0);
        gl_Position = vec4(position.xy, 0.0, 1.0);
        v_texCoord = a_texCoord;
        v_color = a_color;
      }
    `;

    const fragmentShaderSource = `
      precision mediump float;
      
      varying vec2 v_texCoord;
      varying vec4 v_color;
      uniform sampler2D u_texture;
      
      void main() {
        vec4 color = texture2D(u_texture, v_texCoord);
        gl_FragColor = color * v_color;
      }
    `;

    const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (vertexShader && fragmentShader) {
      this.shaderProgram = this.createProgram(vertexShader, fragmentShader);
    }
  }

  private createShader(type: number, source: string): WebGLShader | null {
    if (!this.gl) return null;

    const shader = this.gl.createShader(type);
    if (!shader) return null;

    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  private createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram | null {
    if (!this.gl) return null;

    const program = this.gl.createProgram();
    if (!program) return null;

    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      console.error('Program link error:', this.gl.getProgramInfoLog(program));
      this.gl.deleteProgram(program);
      return null;
    }

    return program;
  }

  private setupBuffers(): void {
    if (!this.gl) return;

    // Position buffer (quad vertices)
    this.positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);

    // Texture coordinate buffer
    this.texCoordBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
    
    const texCoords = new Float32Array([
      0, 0,
      1, 0,
      0, 1,
      0, 1,
      1, 0,
      1, 1,
    ]);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, texCoords, this.gl.STATIC_DRAW);

    // Color buffer
    this.colorBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
    
    const colors = new Float32Array([
      1, 1, 1, 1,
      1, 1, 1, 1,
      1, 1, 1, 1,
      1, 1, 1, 1,
      1, 1, 1, 1,
      1, 1, 1, 1,
    ]);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, colors, this.gl.DYNAMIC_DRAW);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
  }

  private setupAttributes(): void {
    if (!this.gl || !this.shaderProgram) return;

    this.gl.useProgram(this.shaderProgram);

    const positionLocation = this.gl.getAttribLocation(this.shaderProgram, 'a_position');
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.enableVertexAttribArray(positionLocation);
    this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);

    const texCoordLocation = this.gl.getAttribLocation(this.shaderProgram, 'a_texCoord');
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
    this.gl.enableVertexAttribArray(texCoordLocation);
    this.gl.vertexAttribPointer(texCoordLocation, 2, this.gl.FLOAT, false, 0, 0);

    const colorLocation = this.gl.getAttribLocation(this.shaderProgram, 'a_color');
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
    this.gl.enableVertexAttribArray(colorLocation);
    this.gl.vertexAttribPointer(colorLocation, 4, this.gl.FLOAT, false, 0, 0);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    this.gl.useProgram(null);
  }

  private createTextureFromBitmap(bitmap: Bitmap): WebGLTexture | null {
    if (!this.gl) return null;

    const texture = this.gl.createTexture();
    if (!texture) return null;

    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      bitmap
    );

    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);

    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
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
    x: number,
    y: number,
    width: number,
    height: number,
    transform: PlatformVideo.Transform,
    color: [number, number, number, number] = [1, 1, 1, 1]
  ): void {
    if (!this.gl || !this.shaderProgram) return;

    const vertices = new Float32Array([
      x, y,
      x + width, y,
      x, y + height,
      x, y + height,
      x + width, y,
      x + width, y + height,
    ]);

    if (!this.vertexBuffer) {
      this.vertexBuffer = this.gl.createBuffer();
    }

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.DYNAMIC_DRAW);

    const matrix = this.createMatrix(transform);
    const matrixLocation = this.gl.getUniformLocation(this.shaderProgram, 'u_matrix');
    
    const colors = new Float32Array([
      ...color, ...color, ...color, ...color, ...color, ...color
    ]);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, colors, this.gl.DYNAMIC_DRAW);

    this.gl.uniformMatrix3fv(matrixLocation, false, matrix);
    
    const positionLocation = this.gl.getAttribLocation(this.shaderProgram, 'a_position');
    const colorLocation = this.gl.getAttribLocation(this.shaderProgram, 'a_color');
    
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
    
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
    this.gl.vertexAttribPointer(colorLocation, 4, this.gl.FLOAT, false, 0, 0);

    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
  }

  private drawEllipse(
    x: number,
    y: number,
    radiusX: number,
    radiusY: number,
    transform: PlatformVideo.Transform,
    color: [number, number, number, number] = [1, 1, 1, 1]
  ): void {
    this.drawRectangle(x - radiusX, y - radiusY, radiusX * 2, radiusY * 2, transform, color);
  }

  private drawShape(
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
    frame: PlatformVideo.VideoFrame | PlatformVideo.HiddenVideoFrame,
    bitmap?: Bitmap,
    dynamicElement?: Bitmap,
    globalTransform?: PlatformVideo.Transform
  ): void {
    if ('alpha' in frame && frame.alpha === 0) return;

    const transform = globalTransform || { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };

    if (bitmap) {
      let texture = this.textureCache.get(bitmap as any) || null;
      if (!texture) {
        texture = this.createTextureFromBitmap(bitmap);
        if (texture) {
          this.textureCache.set(bitmap as any, texture);
        }
      }

      if (texture && this.gl && this.shaderProgram) {
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        
        const textureLocation = this.gl.getUniformLocation(this.shaderProgram, 'u_texture');
        this.gl.uniform1i(textureLocation, 0);

        const layout = (frame as PlatformVideo.VideoFrame).layout;
        this.drawRectangle(
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
        this.drawShape(shape, transform);
      }
    }

    this.gl?.bindTexture(this.gl.TEXTURE_2D, null);
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
      scale = RendererGL.calculateScale(contentMode, videoSize, canvasSize);
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
    if (!this.gl || !this.shaderProgram) {
      console.warn('WebGL not initialized');
      return;
    }

    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.useProgram(this.shaderProgram);

    for (let i = head; i < tail; i++) {
      const sprite = videoEntity.sprites[i];
      const frame = sprite.frames[currentFrame];
      const bitmap = materials.get(sprite.imageKey);
      const dynamicElement = dynamicMaterials.get(sprite.imageKey);

      this.drawSprite(frame, bitmap, dynamicElement, this.globalTransform);
    }

    this.gl.useProgram(null);
  }

  public destroy(): void {
    if (!this.gl) return;

    this.textureCache.forEach(texture => {
      this.gl!.deleteTexture(texture);
    });
    this.textureCache.clear();

    if (this.positionBuffer) this.gl.deleteBuffer(this.positionBuffer);
    if (this.texCoordBuffer) this.gl.deleteBuffer(this.texCoordBuffer);
    if (this.vertexBuffer) this.gl.deleteBuffer(this.vertexBuffer);
    if (this.colorBuffer) this.gl.deleteBuffer(this.colorBuffer);

    if (this.shaderProgram) this.gl.deleteProgram(this.shaderProgram);

    this.gl = null;
    this.shaderProgram = null;
    this.positionBuffer = null;
    this.texCoordBuffer = null;
    this.vertexBuffer = null;
    this.colorBuffer = null;
    this.globalTransform = undefined;
    this.lastResizeKey = "";
  }
}
