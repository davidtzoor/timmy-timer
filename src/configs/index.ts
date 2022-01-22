import dotenv from "dotenv";

const envConfig = dotenv.config();
if (envConfig.error) {
  throw new Error("No .env file found");
}

interface AppConfig {
  port: number;
  queueProcessEveryMs: number;
  redisUrl: string;
  mysqlDbHost: string;
  mysqlUsername: string | undefined;
  mysqlPassword: string | undefined;
  mysqlDatabase: string | undefined;
}

const appConfig: AppConfig = {
  // App
  port: parseInt(<string>process.env.PORT) || 3000,
  // Redis
  queueProcessEveryMs:
    parseInt(<string>process.env.QUEUE_PROCESS_EVERY_MS) || 1000,
  redisUrl: process.env.REDIS_URL || "127.0.0.1:6379",
  // MySQL
  mysqlDbHost: process.env.DB_HOST || "127.0.0.1",
  mysqlUsername: process.env.MYSQL_USERNAME,
  mysqlPassword: process.env.MYSQL_PASSWORD,
  mysqlDatabase: process.env.MYSQL_DATABASE,
};

export default appConfig;
