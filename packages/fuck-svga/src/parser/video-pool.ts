import { Parser } from ".";
import { Env, SE } from "../env";
import { genFilePath, removeTmpFile, writeTmpFile } from "../polyfill/fsm";

export interface Bucket {
  // 远程地址
  origin: string;
  // 本地地址
  local: string;
  // 实例
  entity: Video | ArrayBuffer | null;
}

export interface NeedUpdatePoint {
  action: "remove" | "add";
  start: number;
  end: number;
}

export class VideoPool {
  private point: number = 0;

  private maxRemain: number = 3;

  private remainStart: number = 0;

  private remainEnd: number = 0;

  private buckets: Bucket[] = [];

  private readonly parser = new Parser();

  get length(): number {
    return this.buckets.length;
  }

  private updateRemainPoints() {
    this.remainStart = Math.ceil(this.point - (this.maxRemain - 1) / 2);
    if (this.remainStart < 0) {
      this.remainStart = 0;
    }

    this.remainEnd = this.remainStart + this.maxRemain;
    if (this.remainEnd > this.length) {
      this.remainEnd = this.length;
    }
  }

  private getNeedUpdatePoints(point: number): NeedUpdatePoint[] {
    const { remainStart, remainEnd } = this;

    this.point = point;
    this.updateRemainPoints();

    if (this.remainStart > remainEnd || this.remainEnd < remainStart) {
      return [
        {
          action: "remove",
          start: remainStart,
          end: remainEnd,
        },
        {
          action: "add",
          start: this.remainStart,
          end: this.remainEnd,
        },
      ];
    }

    if (this.remainStart > remainStart && this.remainEnd > remainEnd) {
      return [
        {
          action: "remove",
          start: remainStart,
          end: this.remainStart,
        },
        {
          action: "add",
          start: remainEnd,
          end: this.remainEnd,
        },
      ];
    }

    if (this.remainStart < remainStart && this.remainEnd < remainEnd) {
      return [
        {
          action: "remove",
          start: this.remainEnd,
          end: remainEnd,
        },
        {
          action: "add",
          start: this.remainStart,
          end: remainStart,
        },
      ];
    }

    return [];
  }

  private async getBucket(point: number): Promise<Bucket> {
    if (point < 0 || point >= this.length) {
      return this.buckets[this.point];
    }

    const waits = this.getNeedUpdatePoints(point).map(
      ({ action, start, end }) => {
        const waiting: Promise<void>[] = [];

        for (let i = start; i < end; i++) {
          const bucket = this.buckets[i];
          if (action === "remove") {
            bucket.entity = null;
            waiting.push(Promise.resolve());
          } else if (action === "add") {
            const p = this.parser.load(bucket.local).then((video) => {
              bucket.entity = video;
            });

            waiting.push(p);
          }
        }

        return Promise.all(waiting);
      }
    );

    await Promise.all(waits);

    return this.get();
  }

  async prepare(
    urls: string[],
    point?: number,
    maxRemain?: number
  ): Promise<void> {
    const { parser } = this;

    if (typeof point === "number" && point > 0 && point < urls.length) {
      this.point = point;
    } else {
      this.point = 0;
    }

    if (typeof maxRemain === "number" && maxRemain > 0) {
      this.maxRemain = maxRemain;
    } else {
      this.maxRemain = 3;
    }

    this.updateRemainPoints();
    this.buckets = await Promise.all(
      urls.map(async (url: string, index: number) => {
        const bucket: Bucket = {
          origin: url,
          local: "",
          entity: null,
        };

        const buff = await parser.download(bucket.origin);

        if (buff !== null) {
          if (Env.is(SE.H5)) {
            bucket.local = url;
            bucket.entity = Parser.parseVideo(buff, url);
          } else {
            const filePath = genFilePath(
              url.substring(url.lastIndexOf("/") + 1)
            );
            await writeTmpFile(buff, filePath);

            bucket.local = filePath;

            if (this.remainStart >= index && index < this.remainEnd) {
              bucket.entity = Parser.parseVideo(buff, url);
            }
          }
        }

        return bucket;
      })
    );
  }

  get(): Promise<Bucket> {
    return this.getBucket(this.point);
  }

  prev(): Promise<Bucket> {
    return this.getBucket(this.point - 1);
  }

  next(): Promise<Bucket> {
    return this.getBucket(this.point + 1);
  }

  go(pos: number): Promise<Bucket> {
    return this.getBucket(pos);
  }

  clear(): Promise<string[]> {
    const { buckets } = this;

    this.buckets = [];
    this.point = 0;
    return Promise.all(
      buckets.map((bucket: Bucket) => removeTmpFile(bucket.local))
    );
  }
}
