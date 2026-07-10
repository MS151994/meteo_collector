import {inject, injectable} from 'inversify';
import {TYPES} from '../infrastructure/ioc/Types';
import {LoggerService} from '../infrastructure/logger/LoggerService';
import {HttpClient} from '../infrastructure/http/HttpClient';
import {PostWarningEventHttpQuery} from '../infrastructure/http/query/PostWarningEventHttpQuery';
import {NotificationPayload} from '../payloads/NotificationPayload';
import Env from '../infrastructure/env/Env';

@injectable()
export class NotificationEventService {
  @inject(TYPES.LoggerService)
  private readonly logger: LoggerService;

  @inject(TYPES.HttpClient)
  private readonly httpClient: HttpClient;

  private readonly prefix: string = '[NotificationEvent]';

  public async notify(payload: NotificationPayload): Promise<boolean> {
    if (!this.canNotify()) {
      this.logger.warning(`${this.prefix} event send skipped: missing configuration`);

      return false;
    }

    await this.httpClient.execute(new PostWarningEventHttpQuery(payload));

    return true;
  }

  private canNotify(): boolean {
    return !(!Env.USER || !Env.PASSWORD);
  }
}
