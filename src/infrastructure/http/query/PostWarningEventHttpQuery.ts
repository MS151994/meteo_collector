import {QueryableInterface} from '../interface/QueryableInterface';
import {QueryInterface} from '../interface/QueryInterface';
import Env from '../../env/Env';

export class PostWarningEventHttpQuery implements QueryableInterface {
  private readonly authToken = Buffer.from(`${Env.USER}:${Env.PASSWORD}`).toString('base64');
  private readonly eventUrl: string = Env.EVENT_GATEWAY;
  private readonly payload: Record<string, string> = {};

  public constructor(payload: Record<string, string>) {
    this.payload = payload;
  }

  public getQuery(): QueryInterface {
    return {
      url: this.eventUrl,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${this.authToken}`,
      },
      form: this.payload,
    };
  }
}
