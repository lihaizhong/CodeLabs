import Reader from "../io/Reader";
export default class MovieParams {
    /**
     * Decodes a MovieParams message from the specified reader.
     * @function decode
     * @memberof com.opensource.svga.MovieParams
     * @static
     * @param {$protobuf.Reader} reader Reader to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.MovieParams} MovieParams
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: Reader, length?: number): PlatformVideo.VideoParams;
    /**
     * MovieParams viewBoxWidth.
     * @member {number} viewBoxWidth
     * @memberof com.opensource.svga.MovieParams
     * @instance
     */
    viewBoxWidth: number;
    /**
     * MovieParams viewBoxHeight.
     * @member {number} viewBoxHeight
     * @memberof com.opensource.svga.MovieParams
     * @instance
     */
    viewBoxHeight: number;
    /**
     * MovieParams fps.
     * @member {number} fps
     * @memberof com.opensource.svga.MovieParams
     * @instance
     */
    fps: number;
    /**
     * MovieParams frames.
     * @member {number} frames
     * @memberof com.opensource.svga.MovieParams
     * @instance
     */
    frames: number;
}
