import express, { Express, Request, Response } from "express";
import { createConnection } from "typeorm";
import helmet from "helmet";

import { TimersQueue } from "./services/timers-queue";
import appConfig from "./configs";
import timersRoutes from "./api/timers";
import handleErrors from "./middleware/error-handler";
import connectionOptions from "./configs/mysql";

const app: Express = express();

app.use(helmet());
app.use(express.json());

async function startServer() {
  try {
    // Create mysql connection
    await createConnection(connectionOptions);
    const queue = new TimersQueue(
      appConfig.redisUrl,
      appConfig.queueProcessEveryMs
    );
    queue.start();
    app.set("queue", queue);
    app.use(timersRoutes);
    app.use(handleErrors);
    app.listen(appConfig.port, () =>
      console.log(`Running on ${appConfig.port} ⚡`)
    );
  } catch (e) {
    console.error("🔥 Server could not start", e);
    process.exit(1);
  }
}

startServer();
