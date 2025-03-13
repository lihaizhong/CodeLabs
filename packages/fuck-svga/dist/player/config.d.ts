export declare class Config {
    fillMode: PLAYER_FILL_MODE;
    playMode: PLAYER_PLAY_MODE;
    startFrame: number;
    endFrame: number;
    loopStartFrame: number;
    loop: number;
    register(config: Partial<PlayerConfig>): void;
    setItem(key: keyof PlayerConfig, value: any): void;
    getConfig(entity: Video): {
        currFrame: number;
        startFrame: number;
        endFrame: number;
        totalFrame: number;
        spriteCount: number;
        aniConfig: {
            duration: number;
            loopStart: number;
            loop: number;
            fillValue: number;
        };
    };
}
