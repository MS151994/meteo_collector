import winston, {LoggerOptions} from 'winston';
import Env from '../env/Env';

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
  level: Env.LOG_LEVEL,
  levels: loggerLevels,
};
