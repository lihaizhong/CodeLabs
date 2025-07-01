import { definePlugin } from "../definePlugin";
/**
 * 用于处理requestAnimationFrame
 * @returns
 */
export default definePlugin({
    name: "rAF",
    install() {
        const { env } = this.globals;
        function requestAnimationFrameImpl() {
            return (callback) => setTimeout(callback, Math.max(0, 16 - (Date.now() % 16)));
        }
        if (env === "h5") {
            const rAF = "requestAnimationFrame" in globalThis
                ? requestAnimationFrame
                : requestAnimationFrameImpl();
            return (_, callback) => rAF(callback);
        }
        return (canvas, callback) => {
            // 检查canvas是否存在
            try {
                return canvas.requestAnimationFrame(callback);
            }
            catch (error) {
                console.warn(error.message);
                return requestAnimationFrameImpl()(callback);
            }
        };
    },
});
