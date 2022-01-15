import db from "./db";
import moment from "moment";
import dotenv from "dotenv";
import axios, { AxiosError } from "axios";

dotenv.config();

const PROCESS_EVERY_SEC = parseInt(process.env.PROCESS_EVERY_SEC || "") || 5;
let lastCheckpoint: number = moment().unix();

enum Status {
  Scheduled = "SCHEDULED",
  InProgress = "IN_PROGRESS",
  Done = "DONE",
  Failed = "FAILED",
}

const calculateTimerSeconds = (
  hours: number,
  minutes: number,
  seconds: number
): number =>
  moment
    .duration({ hours: hours, minutes: minutes, seconds: seconds })
    .asSeconds();

const fireTimer = async (id: number | bigint, url: string): Promise<void> => {
  const updateTimerStatus = (id: number | bigint, status: string): void => {
    db.prepare(
      `UPDATE timers
        SET status = @status
        WHERE id = @id`
    ).run({ id, status });
  };

  try {
    await axios.post(`${url}/${id}`);
    updateTimerStatus(id, Status.Done);
  } catch (error) {
    console.log(`Timer id ${id} failed to fire`);
    updateTimerStatus(id, Status.Failed);
  }
};

const fetchPendingTimers = (initRun: boolean): any[] => {
  const whereClause = initRun
    ? `execute_at <= @now AND status IN ('SCHEDULED', 'IN_PROGRESS')`
    : `execute_at BETWEEN @now - 1 AND @now + ${PROCESS_EVERY_SEC} AND status = 'SCHEDULED'`;
  const fetchScheduledTimers = db.transaction(() => {
    const now = moment().unix();
    const timers = db
      .prepare(
        `SELECT id, execute_at, url
         FROM timers
         WHERE ${whereClause}`
      )
      .all({ now });
    db.prepare(
      `UPDATE timers 
       SET status = 'IN_PROGRESS' 
       WHERE ${whereClause}`
    ).run({ now });
    return timers;
  });
  return fetchScheduledTimers();
};

const scheduleTimer = (id: number | bigint, url: string, executeAt: number) => {
  setTimeout(
    fireTimer.bind(null, id, url),
    Math.max((executeAt - moment().unix()) * 1000, 0)
  );
};

export const createTimer = (
  hours: number,
  minutes: number,
  seconds: number,
  url: string
): number | bigint => {
  const executeAt: number =
    moment().unix() + calculateTimerSeconds(hours, minutes, seconds);
  const shouldScheduleNow: boolean =
    executeAt - lastCheckpoint <= PROCESS_EVERY_SEC;
  const timerStatus: Status = shouldScheduleNow
    ? Status.InProgress
    : Status.Scheduled;

  const info = db
    .prepare(
      `INSERT INTO timers (execute_at, status, url) VALUES (@executeAt, @timerStatus, @url)`
    )
    .run({ executeAt, timerStatus, url });
  if (shouldScheduleNow) {
    scheduleTimer(info.lastInsertRowid, url, executeAt);
  }
  return info.lastInsertRowid;
};

export const getTimeLeft = (id: number | bigint): number | undefined => {
  const timer = db
    .prepare(`SELECT execute_at FROM timers WHERE id = @id`)
    .get({ id });

  if (timer === undefined) {
    return;
  }

  return Math.max(timer.execute_at - moment().unix(), 0);
};

export const processPendingTimers = async (): Promise<void> => {
  const timers = fetchPendingTimers(true).map((timer) =>
    fireTimer(timer.id, timer.url)
  );
  await Promise.all(timers);
};

export const schedule = async (): Promise<void> => {
  lastCheckpoint = moment().unix();
  fetchPendingTimers(false).map((timer) =>
    scheduleTimer(timer.id, timer.url, timer.execute_at)
  );
};
