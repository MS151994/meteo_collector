import {inject, injectable} from 'inversify';
import Env from '../infrastructure/env/Env';
import {TYPES} from '../infrastructure/ioc/Types';
import {RedisClient} from '../infrastructure/redis/RedisClient';
import {LoggerService} from '../infrastructure/logger/LoggerService';
import {WarningSignatureHelper} from '../helper/WarningSignatureHelper';
import {WarningsResponsePayload} from '../payloads/WarningsResponsePayload';
import {WarningPayload} from '../payloads/WarningPayload';

const DAY_SECONDS = 86_400;

export interface WarningHistoryEntry {
  recordedAt: string;
  location: string;
  eventName: string;
  level: number;
  probability: number;
  content: string;
  comment: string;
  validFrom: string | null;
  validTo: string | null;
  published: string | null;
}

@injectable()
export class WarningsHistoryService {
  @inject(TYPES.RedisClient)
  private readonly redis: RedisClient;

  @inject(TYPES.LoggerService)
  private readonly logger: LoggerService;

  @inject(TYPES.WarningSignatureHelper)
  private readonly signatureHelper: WarningSignatureHelper;

  private readonly prefix: string = '[WarningsHistory]';
  private readonly keyPrefix: string = `meteo:history:${Env.WARNINGS_TERRITORY}`;

  public async record(warnings: WarningsResponsePayload): Promise<void> {
    if (!Env.ENABLE_HISTORY) {
      return;
    }

    const ttl = Env.HISTORY_RETENTION_DAYS * DAY_SECONDS;
    const recordedAt = new Date().toISOString();

    for (const warning of warnings.getWarnings()) {
      const entry = this.buildEntry(warning, warnings.location, recordedAt);
      const key = `${this.keyPrefix}:${this.signatureHelper.forHistory(warning)}`;
      try {
        await this.redis.setNx(key, JSON.stringify(entry), ttl);
      } catch (error) {
        this.logger.warning(
          `${this.prefix} failed to record history: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }

  public async getHistory(): Promise<WarningHistoryEntry[]> {
    try {
      const raw = await this.redis.scanValues(`${this.keyPrefix}:*`);
      return raw
        .map((item: string) => JSON.parse(item) as WarningHistoryEntry)
        .sort((a, b) => a.recordedAt.localeCompare(b.recordedAt));
    } catch (error) {
      this.logger.warning(
        `${this.prefix} failed to read history: ${error instanceof Error ? error.message : String(error)}`,
      );
      return [];
    }
  }

  private buildEntry(warning: WarningPayload, location: string, recordedAt: string): WarningHistoryEntry {
    return {
      recordedAt,
      location,
      eventName: warning.getPhenomenonName(),
      level: warning.getLevel(),
      probability: warning.getProbability(),
      content: warning.getContent(),
      comment: warning.getComment(),
      validFrom: warning.getValidFrom()?.toISOString() ?? null,
      validTo: warning.getValidTo()?.toISOString() ?? null,
      published: warning.getPublishDate()?.toISOString() ?? null,
    };
  }
}
