import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import helmet from "helmet";
import dotenv from "dotenv";
import moment from "moment";

dotenv.config();

const PORT = process.env.PORT || 3000;
const app: Express = express();

let global_id: number = 1;

interface Timer {
  executeAt: number;
  url: string;
}

let timers: { [id: number]: Timer } = {};

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function calculateTimeout(
  hours: number,
  minutes: number,
  seconds: number
): number {
  return moment
    .duration({ hours: hours, minutes: minutes, seconds: seconds })
    .asSeconds();
}

function timerWebhook(url: string, id: number): void {
  console.log(
    `Fired webhook to ${timers[id].url}/${id} ${
      timers[id].executeAt === moment().unix() ? "on time" : "not on time"
    }`
  );
  // console.log(`Fire webhoook to ${url}/${id}`)
}

app.get('/', (req: Request, res: Response) => {
  res.send('<h1>Hello from the TypeScript world!</h1>');
});

app.post("/timers", (req: Request, res: Response) => {
  const unique_id = global_id++;
  const timeoutSeconds: number = calculateTimeout(
    req.body.hours,
    req.body.minutes,
    req.body.seconds
  );

  timers[unique_id] = {
    executeAt: moment().unix() + timeoutSeconds,
    url: req.body.url,
  };

  setTimeout(timerWebhook, timeoutSeconds * 1000, req.body.url, unique_id);

  res.json({ id: unique_id });
});

app.listen(PORT, () => console.log(`Running on ${PORT} ⚡`));
