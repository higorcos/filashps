import fs from "node:fs";
import path from "node:path";
import pino from "pino";

const LOG_DIR = path.join(process.cwd(), "logs");
const LOG_FILE = path.join(LOG_DIR, "app.log");

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const fileDestination = pino.destination({ dest: LOG_FILE, mkdir: true, sync: false });

const streams: pino.StreamEntry[] = [{ stream: fileDestination, level: "info" }];

if (process.env.NODE_ENV !== "production") {
  streams.push({
    stream: pino.transport({ target: "pino-pretty", options: { colorize: true } }),
    level: "info",
  });
}

export const logger = pino(
  {
    level: process.env.LOG_LEVEL ?? "info",
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  pino.multistream(streams),
);

declare global {
  var __filasHpsGlobalHandlersRegistered: boolean | undefined;
}

if (!globalThis.__filasHpsGlobalHandlersRegistered) {
  globalThis.__filasHpsGlobalHandlersRegistered = true;

  process.on("uncaughtException", (err) => {
    logger.fatal({ err, stack: err.stack }, "uncaughtException");
  });

  process.on("unhandledRejection", (reason) => {
    const err = reason instanceof Error ? reason : new Error(String(reason));
    logger.fatal({ err, stack: err.stack }, "unhandledRejection");
  });
}
