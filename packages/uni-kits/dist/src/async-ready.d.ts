export type IAsyncReadyOption = {
    only: boolean;
};
export default class AsyncReady {
    static ReadyStatus: {
        initialize: string;
        pending: string;
        completed: string;
    };
    static callReadyFunc(callback: () => void): void | null;
    private status;
    private callbacks;
    private options;
    constructor(option: IAsyncReadyOption);
    ready(callback: any): void;
    wait(): void;
    reset(): void;
    complete(): void;
}
