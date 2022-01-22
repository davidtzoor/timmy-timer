import express, { NextFunction, Request, Response } from "express";

import {
  timersGetValidator,
  timersPostValidator,
  fakeEndpointValidator,
  validate,
} from "@/middleware/validators";
import { TimersQueue } from "@/services/timers-queue";

const router = express.Router();

router.get(
  "/timers/:id",
  timersGetValidator(),
  validate,
  async (req: Request<{ id: number }>, res: Response, next: NextFunction) => {
    try {
      const queue: TimersQueue = req.app.get("queue");
      const id = req.params.id;
      const timeLeft = await queue.getTimeLeft(id);
      res.json({ id, timeLeft });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/timers",
  timersPostValidator(),
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const queue: TimersQueue = req.app.get("queue");
      const id = await queue.createTimer(
        req.body.hours,
        req.body.minutes,
        req.body.seconds,
        req.body.url
      );
      res.json({ id });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
