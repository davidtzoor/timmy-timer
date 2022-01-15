import Database from "better-sqlite3";

const db = new Database("timmy-timer.db");

export const prepareDb = db.transaction(() => {
  // Create timers table
  db.prepare(`CREATE TABLE IF NOT EXISTS timers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    execute_at INTEGER NOT NULL,
    status TEXT NOT NULL,
    url TEXT NOT NULL
  )`).run();

  // Create index
  db.prepare(
    `CREATE INDEX IF NOT EXISTS timers_execute_at ON timers(execute_at)`
  ).run();
});

export default db;
