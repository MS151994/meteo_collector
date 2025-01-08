import {Get, JsonController, QueryParam} from 'routing-controllers';
import {inject, injectable} from 'inversify';
import {TYPES} from '../infrastructure/ioc/Types';
import {WarningsService} from '../services/WarningsService';
import {Territory} from '../infrastructure/types/territory';
import {WarningsResponsePayload} from '../payloads/WarningsResponsePayload';

@injectable()
@JsonController('/weather')
export class MeteorologicController {
  @inject(TYPES.WeatherService)
  private readonly warningsService: WarningsService;

  @Get('/warnings')
  public async fetchWarnings(
    @QueryParam('location') location: Territory,
  ): Promise<WarningsResponsePayload> {
    return this.warningsService.getLocalWarnings(location);
  }
}
