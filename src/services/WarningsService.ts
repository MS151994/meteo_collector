import {inject, injectable} from 'inversify';
import {TYPES} from '../infrastructure/ioc/Types';
import {IMGWWarningModel} from '../models/WarningModel';
import {WarningPayload} from '../payloads/WarningPayload';
import {LocationHelper} from '../helper/LocationHelper';
import {LoggerService} from '../infrastructure/logger/LoggerService';
import {TimeHelper} from '../helper/TimeHelper';
import {Territory} from '../infrastructure/types/territory';
import {WarningsResponsePayload} from '../payloads/WarningsResponsePayload';
import {HttpResponseInterface} from '../infrastructure/http/HttpResponseInterface';
import {GetWarningDataFromIMGWHttpQuery} from '../infrastructure/http/query/GetWarningDataFromIMGWHttpQuery';
import {HttpClient} from '../infrastructure/http/HttpClient';

@injectable()
export class WarningsService {
  @inject(TYPES.LocationHelper)
  private readonly locationHelper: LocationHelper;

  @inject(TYPES.TimeHelper)
  private readonly timeHelper: TimeHelper;

  @inject(TYPES.LoggerService)
  private readonly logger: LoggerService;

  @inject(TYPES.HttpClient)
  private readonly httpClient: HttpClient;

  protected readonly prefix: string = 'WarningsService';

  public async getLocalWarnings(territory: Territory): Promise<WarningsResponsePayload> {
    const localWarnings: WarningPayload[] = await this.getWarningsForGivenLocation(territory);

    if (localWarnings.length) {
      this.setDurationTimeForEachWarnings(localWarnings);
    }

    const warningsResponse: WarningsResponsePayload = new WarningsResponsePayload();

    warningsResponse
      .setWarnings(localWarnings)
      .setLocation(this.locationHelper.getLocationName(territory))
      .setEventsName(this.setPhenomenonNameForEachWarnings(localWarnings))
      .setEstimatedEndTime(this.getDurationForMaxWarning(localWarnings));

    return warningsResponse;
  }

  private async getWarningsForGivenLocation(territory: Territory): Promise<WarningPayload[]> {
    const warnings: IMGWWarningModel[] = await this.getWarningsFromAPI();

    return warnings
      .filter((warning: IMGWWarningModel): boolean =>
        warning.getTerritory().includes(Number(this.locationHelper.getId(territory))),
      )
      .map((element: IMGWWarningModel): WarningPayload => new WarningPayload(element));
  }

  private getDurationForMaxWarning(warnings: WarningPayload[]): string {
    if (!warnings.length) {
      return 'Not available';
    }

    return warnings
      .reduce((maxWarning: WarningPayload, currentWarning: WarningPayload) => {
        return currentWarning.getLevel() > maxWarning.getLevel() ? currentWarning : maxWarning;
      })
      .getDuration();
  }

  private setDurationTimeForEachWarnings(warnings: WarningPayload[]): void {
    this.logger.debug(`[${this.prefix}] Set duration times for each warnings`);
    for (const warning of warnings) {
      warning.setEstimatedEndTime(this.timeHelper.getDurationTime(warning.getValidTo()));
    }
  }

  private setPhenomenonNameForEachWarnings(warnings: WarningPayload[]): string {
    if (!warnings.length) {
      return 'No warnings';
    }
    this.logger.debug(`[${this.prefix}] Set phenomenon name for each warnings`);

    let tmp: string = '';
    if (warnings.length) {
      warnings.map((warning: WarningPayload): void => {
        tmp += warning.getPhenomenonName() + ', ';
      });
    }

    return tmp.substring(0, tmp.length - 2);
  }

  private async getWarningsFromAPI(): Promise<IMGWWarningModel[]> {
    const warnings: IMGWWarningModel[] = [];
    try {
      const response: HttpResponseInterface = await this.httpClient.execute(new GetWarningDataFromIMGWHttpQuery());

      if (response.body.length) {
        response.body.map((warning: any) => {
          warnings.push(new IMGWWarningModel(warning));
        });
      }

      return warnings;
    } catch (err) {
      this.logger.warning(
        `[${this.prefix}] Not found warnings in IMGW meteorologic. error: ${(err as Error).message}, return empty array`,
      );

      return warnings;
    }
  }
}
