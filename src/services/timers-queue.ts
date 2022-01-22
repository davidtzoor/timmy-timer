import moment from "moment";
import Redis, { Redis as RedisInterface } from "ioredis";
import { getRepository } from "typeorm";
import axios from "axios";
import { readFileSync } from "fs";
import path from "path";

import { Timer } from "@/entities/timer";
import { NotFound } from "@/utils/errors";

interface MyRedis extends RedisInterface {
  fetchNextJobs(queueName: string, nextDelayedTs: number): Promise<string[]>;
}

export class TimersQueue {
  readonly delayedQueue: string = "delayed";
  readonly maxJobs: number = 1000;

  // Redis instance
  redis: MyRedis;
  // How often to process jobs from the queue in ms
  processEveryMs: number;

  constructor(redisUrl: string, processEveryMs: number) {
    // @ts-ignore
    this.redis = new Redis(redisUrl);
    this.defineRedisCommands();
    this.processEveryMs = processEveryMs;
  }

  private async defineRedisCommands() {
    const fetchNextJobStr: Buffer = readFileSync(
      path.join(__dirname, "/fetchNextJob.lua")
    );
    this.redis.defineCommand("fetchNextJobs", {
      numberOfKeys: 1,
      lua: fetchNextJobStr.toString(),
    });
  }

  // Starts the timers queue processing
  start() {
    setInterval(this.processJobs.bind(this), this.processEveryMs);
    process.nextTick(this.processJobs.bind(this, true));
  }

  // Process the next 1000 jobs from the delayed queue
  private async processJobs(initRun: boolean): Promise<void> {
    const jobs = await this.redis.fetchNextJobs(
      this.delayedQueue,
      moment().unix()
    );
    const readyJobs = jobs.map(async (job) => {
      const timer = Timer.deserialize(job);
      try {
        console.log(
          `Firing webhook ${timer.id}/${timer.executeAt}, at ${moment().unix()}`
        );
        await axios.post(`${timer.url}/${timer.id}`);
      } catch (error) {
        console.error(`☠️ Failed to fire webook ${timer.url}/${timer.id}`, error);
      }
    });
    await Promise.all(readyJobs);
  }

  // Creates a timer to be executed in the provided time.
  // Returns the timer id.
  async createTimer(
    hours: number,
    minutes: number,
    seconds: number,
    url: string
  ): Promise<number> {
    const timer = new Timer();
    timer.executeAt =
      moment().unix() + this.calculateTimerSeconds(hours, minutes, seconds);
    timer.url = url;
    // Persist to DB
    await getRepository(Timer).save(timer);
    // Add to delayed queue
    this.redis.zadd(this.delayedQueue, timer.executeAt, timer.serialize());
    return timer.id;
  }

  // Returns the seconds left on timer `:id`, 0 if no seconds left
  async getTimeLeft(id: number): Promise<number> {
    const timer = await getRepository(Timer).findOne(id);

    if (timer === undefined) {
      throw new NotFound(`Requested id ${id} not found.`);
    } else {
      return Math.max(timer.executeAt - moment().unix(), 0);
    }
  }

  // Converts hours, minutes, seconds to seconds
  private calculateTimerSeconds(
    hours: number,
    minutes: number,
    seconds: number
  ): number {
    return moment
      .duration({ hours: hours, minutes: minutes, seconds: seconds })
      .asSeconds();
  }
}
