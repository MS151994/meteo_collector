import winston, { LoggerOptions } from "winston";

const loggerLevels = {
  error: 1,
  warn: 2,
  help: 3,
  crit: 4,
  info: 5,
  debug: 6,
  verbose: 7,
};

export const LoggerSettings: LoggerOptions = {
  silent: false,
  transports: [new winston.transports.Console()],
  exitOnError: false,
  level: process.env.LOG_LEVEL ?? "debug",
  levels: loggerLevels,
};
