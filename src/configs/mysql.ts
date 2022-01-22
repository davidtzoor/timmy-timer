import dotenv from "dotenv";
import { ConnectionOptions } from "typeorm";

import { Timer } from "@/entities/timer";
import appConfig from "@/configs";

dotenv.config();

const connectionOptions: ConnectionOptions = {
  type: "mysql",
  host: appConfig.mysqlDbHost || "127.0.0.1",
  port: 3306,
  username: appConfig.mysqlUsername,
  password: appConfig.mysqlPassword,
  database: appConfig.mysqlDatabase,
  synchronize: true,
  logging: false,
  entities: [Timer],
};

export default connectionOptions;
