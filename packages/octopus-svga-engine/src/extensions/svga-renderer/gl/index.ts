import type { Bitmap, PlatformCanvas, PlatformOffscreenCanvas } from "octopus-platform";
import { RendererGL } from "./RendererGL";

export interface GLRendererOptions {
  glContext: WebGLRenderingContext;
}

export const createGLRenderer = ({ glContext }: GLRendererOptions): RendererGL => {
  return new RendererGL(glContext);
};

export const detectGLSupport = (): {
  webgl: boolean;
  webgl2: boolean;
  maxTextureSize: number;
  maxVertexAttribs: number;
} => {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl');
  const gl2 = canvas.getContext('webgl2');
  
  return {
    webgl: !!gl,
    webgl2: !!gl2,
    maxTextureSize: gl ? (gl as WebGLRenderingContext).getParameter((gl as WebGLRenderingContext).MAX_TEXTURE_SIZE) : 0,
    maxVertexAttribs: gl ? (gl as WebGLRenderingContext).getParameter((gl as WebGLRenderingContext).MAX_VERTEX_ATTRIBS) : 0
  };
};

export interface GLShader {
  program: WebGLProgram;
  vertexShader: WebGLShader;
  fragmentShader: WebGLShader;
}

export const RendererGLExtension = {
  stick:
    (
      gl: WebGLRenderingContext,
      bitmap: Bitmap
    ) =>
    () => {
      const texture = gl.createTexture();
      if (!texture) return;
      
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        bitmap
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.bindTexture(gl.TEXTURE_2D, null);
    },
  clear: (
    type: "CL" | "RE",
    gl: WebGLRenderingContext,
    canvas: PlatformCanvas | PlatformOffscreenCanvas,
    width: number,
    height: number
  ) => {
    if (type === "CL") {
      return () => {
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
      };
    }

    return () => {
      (canvas as any).width = width;
      (canvas as any).height = height;
      gl.viewport(0, 0, width, height);
    };
  },
};

export { RendererGL };