import {QueryableInterface} from '../interface/QueryableInterface';
import {QueryInterface} from '../interface/QueryInterface';

export class GetWarningDataFromIMGWHttpQuery implements QueryableInterface {
  public getQuery(): QueryInterface {
    return {
      url: 'https://danepubliczne.imgw.pl/api/data/warningsmeteo',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }
}
