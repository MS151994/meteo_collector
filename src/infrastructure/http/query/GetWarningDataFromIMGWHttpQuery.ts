import {QueryableInterface} from '../interface/QueryableInterface';
import {QueryInterface} from '../interface/QueryInterface';
import Env from '../../env/Env';

export class GetWarningDataFromIMGWHttpQuery implements QueryableInterface {
  protected readonly url: string = Env.IMGW_API_HOST;

  public getQuery(): QueryInterface {
    return {
      url: this.url,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }
}
