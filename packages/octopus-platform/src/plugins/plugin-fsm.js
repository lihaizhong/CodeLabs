import { definePlugin } from "../definePlugin";
/**
 * 用于处理本地文件存储
 * @returns
 */
export default definePlugin({
    name: "local",
    install() {
        const { env, br } = this.globals;
        if (env === "h5") {
            return null;
        }
        const fsm = br.getFileSystemManager();
        return {
            write: (data, filePath) => {
                return new Promise((resolve, reject) => {
                    fsm.writeFile({
                        filePath,
                        data,
                        success: () => resolve(filePath),
                        fail: reject,
                    });
                });
            },
            read: (filePath) => {
                return new Promise((resolve, reject) => {
                    fsm.readFile({
                        filePath,
                        success: (res) => resolve(res.data),
                        fail: reject,
                    });
                });
            },
            remove: (filePath) => {
                return new Promise((resolve, reject) => {
                    fsm.unlink({
                        filePath,
                        success: () => resolve(filePath),
                        fail: reject,
                    });
                });
            },
        };
    },
});
