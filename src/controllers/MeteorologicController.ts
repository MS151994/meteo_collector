import {Get, JsonController, QueryParam} from 'routing-controllers';
import {inject, injectable} from 'inversify';
import {TYPES} from '../infrastructure/ioc/Types';
import {Territory} from '../infrastructure/types/territory';
import {WarningsResponsePayload} from '../payloads/WarningsResponsePayload';
import {WeatherApplication} from '../application/WeatherApplication';

@injectable()
@JsonController('/weather')
export class MeteorologicController {
  @inject(TYPES.WeatherApplication)
  private readonly weather: WeatherApplication;

  @Get('/warnings')
  public async fetchWarnings(@QueryParam('location') location: Territory): Promise<WarningsResponsePayload> {
    return this.weather.getWarnings(location);
  }
}
