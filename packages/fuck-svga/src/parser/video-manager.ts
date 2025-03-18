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

export class VideoManager {
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
    if (this.point < Math.ceil(this.maxRemain / 2)) {
      this.remainStart = 0;
      this.remainEnd = this.maxRemain;
    } else if (this.length - this.point < Math.floor(this.maxRemain / 2)) {
      this.remainStart = this.remainEnd - this.maxRemain;
      this.remainEnd = this.length;
    } else {
      this.remainStart = Math.floor(this.point - this.maxRemain / 2);
      this.remainEnd = this.remainStart + this.maxRemain;
    }
  }

  private getNeedUpdatePoints(point: number): NeedUpdatePoint[] {
    const { remainStart, remainEnd } = this;

    this.point = point;
    this.updateRemainPoints();

    if (remainStart === remainEnd) {
      return [
        {
          action: "add",
          start: this.remainStart,
          end: this.remainEnd,
        },
      ];
    }

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

    this.point =
      typeof point === "number" && point > 0 && point < urls.length ? point : 0;
    this.maxRemain =
      typeof maxRemain === "number" && maxRemain > 0 ? maxRemain : 3;
    this.updateRemainPoints();
    this.buckets = await Promise.all(
      urls.map(async (url: string, index: number) => {
        const bucket: Bucket = {
          origin: url,
          local: "",
          entity: null,
        };

        if (Env.is(SE.H5)) {
          bucket.local = url;
          if (this.remainStart >= index && index < this.remainEnd) {
            bucket.entity = await parser.load(url);
          }
        } else {
          const buff = await parser.download(bucket.origin);
          if (buff) {
            const filePath = genFilePath(
              url.substring(url.lastIndexOf("/") + 1),
              'full'
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

  get(): Bucket {
    return this.buckets[this.point];
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
    this.point = this.remainStart = this.remainEnd = 0;
    this.maxRemain = 3;

    return Promise.all(
      buckets.map((bucket: Bucket) => removeTmpFile(bucket.local))
    );
  }
}
