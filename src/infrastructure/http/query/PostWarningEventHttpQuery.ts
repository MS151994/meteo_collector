import {QueryableInterface} from '../interface/QueryableInterface';
import {QueryInterface} from '../interface/QueryInterface';
import Env from '../../env/Env';
import {NotificationPayload} from '../../../payloads/NotificationPayload';

export class PostWarningEventHttpQuery implements QueryableInterface {
  private readonly authToken = Buffer.from(`${Env.USER}:${Env.PASSWORD}`).toString('base64');
  private readonly eventUrl: string = Env.EVENT_GATEWAY;

  public constructor(private readonly event: NotificationPayload) {}

  public getQuery(): QueryInterface {
    return {
      url: this.eventUrl,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${this.authToken}`,
      },
      form: this.event.toForm(),
    };
  }
}
