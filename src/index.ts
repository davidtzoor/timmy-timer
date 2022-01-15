import express, { Express, Request, Response } from "express";
import helmet from "helmet";
import dotenv from "dotenv";

import { prepareDb } from "./services/db";
import { processPendingTimers, schedule } from "./services/timers";
import timersRoutes from "./routes/timers";

dotenv.config();

const PORT = process.env.PORT || 3000;
const PROCESS_EVERY_SEC = parseInt(process.env.PROCESS_EVERY_SEC || "") || 5;
const app: Express = express();

app.use(helmet());
app.use(express.json());

prepareDb();
(async () => await processPendingTimers())();
setInterval(schedule, PROCESS_EVERY_SEC * 1000);

app.use(timersRoutes);

app.listen(PORT, () => console.log(`Running on ${PORT} ⚡`));
