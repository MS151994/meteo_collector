import winston, { LoggerOptions } from "winston";

export const LoggerSettings: LoggerOptions = {
  silent: false,
  transports: [new winston.transports.Console()],
  exitOnError: false,
};
