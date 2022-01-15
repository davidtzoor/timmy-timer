import express, { Request, Response } from "express";
import moment from "moment";

import { createTimer, getTimeLeft } from "../services/timers";

const router = express.Router();

let global_id: number = 1;

interface Timer {
  executeAt: number;
  url: string;
}

let timers: { [id: number]: Timer } = {};

router.get("/timers/:id", (req: Request<{ id: number }>, res: Response) => {
  const reqId: number = req.params.id;

  const timeLeft = getTimeLeft(reqId);

  if (timeLeft === undefined) {
    console.error(`Requested id ${reqId} not found.`)
    return res.sendStatus(404);
  }
  
  res.json({ id: reqId, time_left: timeLeft });
});

router.post("/timers", (req: Request, res: Response) => {
  const id = createTimer(req.body.hours, req.body.minutes, req.body.seconds, req.body.url);
  res.json({ id });
});

export default router;