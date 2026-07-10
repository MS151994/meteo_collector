import {inject, injectable} from 'inversify';
import {TYPES} from '../infrastructure/ioc/Types';
import {LoggerService} from '../infrastructure/logger/LoggerService';
import {RedisClient} from '../infrastructure/redis/RedisClient';
import {WarningSignatureHelper} from '../helper/WarningSignatureHelper';
import {WarningNotificationFactory} from './WarningNotificationFactory';
import {NotificationEventService} from './NotificationEventService';
import {WarningsResponsePayload} from '../payloads/WarningsResponsePayload';
import {WarningPayload} from '../payloads/WarningPayload';
import Env from '../infrastructure/env/Env';

const FALLBACK_TTL_SECONDS = 86_400;
const BUFFER_SECONDS = 3_600;

@injectable()
export class WarningNotifier {
  @inject(TYPES.LoggerService)
  private readonly logger: LoggerService;

  @inject(TYPES.RedisClient)
  private readonly redis: RedisClient;

  @inject(TYPES.WarningSignatureHelper)
  private readonly signatureHelper: WarningSignatureHelper;

  @inject(TYPES.WarningNotificationFactory)
  private readonly factory: WarningNotificationFactory;

  @inject(TYPES.NotificationEventService)
  private readonly notificationService: NotificationEventService;

  private readonly prefix: string = '[WarningNotifier]';
  private readonly keyPrefix: string = `meteo:notified:${Env.WARNINGS_TERRITORY}`;

  public async notifyNew(warnings: WarningsResponsePayload): Promise<void> {
    for (const warning of warnings.getWarnings()) {
      try {
        await this.notifyOne(warning);
      } catch (error) {
        this.logger.error(`${this.prefix} notify error: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  private async notifyOne(warning: WarningPayload): Promise<void> {
    const key = `${this.keyPrefix}:${this.signatureHelper.forNotification(warning)}`;
    if ((await this.redis.get(key)) !== null) {
      return;
    }

    const sent = await this.notificationService.notify(this.factory.fromWarning(warning));
    if (sent) {
      await this.redis.setNx(key, '1', this.dedupTtl(warning));
    }
  }

  private dedupTtl(warning: WarningPayload): number {
    const validTo = warning.getValidTo();
    if (!validTo) {
      return FALLBACK_TTL_SECONDS;
    }
    const seconds = Math.floor((validTo.getTime() - Date.now()) / 1000) + BUFFER_SECONDS;
    return seconds > 60 ? seconds : FALLBACK_TTL_SECONDS;
  }
}
