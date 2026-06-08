import {createLogger, format, Logger, transports} from 'winston';
import {inject, injectable} from 'inversify';
import {TYPES} from '../ioc/Types';
import {AsyncLocalStorageService} from '../middleware/AsyncLocalStorageService';

@injectable()
export class LoggerService {
  @inject(TYPES.AsyncLocalStorageService)
  private readonly asyncLocalStorage: AsyncLocalStorageService;

  private readonly logger: Logger;

  public constructor() {
    this.logger = this.createLogger();
  }

  public emergency(message: string, metadata?: Record<string, unknown>): void {
    this.logger.emerg(message, metadata);
  }

  public alert(message: string, metadata?: Record<string, unknown>): void {
    this.logger.alert(message, metadata);
  }

  public critical(message: string, metadata?: Record<string, unknown>): void {
    this.logger.crit(message, metadata);
  }

  public error(message: string, metadata?: Record<string, unknown>): void {
    this.logger.error(message, metadata);
  }

  public warning(message: string, metadata?: Record<string, unknown>): void {
    this.logger.warn(message, metadata);
  }

  public notice(message: string, metadata?: Record<string, unknown>): void {
    this.logger.notice(message, metadata);
  }

  public info(message: string, metadata?: Record<string, unknown>): void {
    this.logger.info(message, metadata);
  }

  public debug(message: string, metadata?: Record<string, unknown>): void {
    this.logger.debug(message, metadata);
  }

  public verbose(message: string, metadata?: Record<string, unknown>): void {
    this.logger.verbose(message, metadata);
  }

  private createLogger() {
    const transform = this.getTransform();

    return createLogger({
      handleExceptions: true,
      level: process.env.LOG_LEVEL ?? 'info',
      format: format.combine(
        format.label({label: process.title ?? 'worker'}),
        format.errors({stack: true}),
        format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
        format.metadata({fillExcept: ['message', 'level', 'timestamp', 'label']}),
        transform,
      ),
      levels: this.getLevels(),
      transports: [
        new transports.Console({
          format: format.combine(format.uncolorize(), transform),
          silent: process.env.NODE_ENV === 'test',
        }),
      ],
      exitOnError: false,
    });
  }

  private getLevels() {
    return {
      emerg: 0,
      alert: 1,
      crit: 2,
      error: 3,
      warn: 4,
      notice: 5,
      info: 6,
      debug: 7,
      verbose: 8,
    };
  }

  private getTransform() {
    return format.printf((info) => {
      const {level, message, label, timestamp, metadata} = info;
      const requestId = this.asyncLocalStorage.getRequestId();
      const serializedMetadata = this.serializeMetadata(metadata as Record<string, unknown>);

      return JSON.stringify({
        time: timestamp,
        level,
        label,
        requestId: requestId || undefined,
        message,
        ...serializedMetadata,
      });
    });
  }

  private serializeMetadata(metadata?: Record<string, unknown>): Record<string, unknown> {
    if (!metadata || Object.keys(metadata).length === 0) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(metadata).map(([key, value]) => [
        key,
        value instanceof Error ? {name: value.name, message: value.message, stack: value.stack} : value,
      ]),
    );
  }
}
