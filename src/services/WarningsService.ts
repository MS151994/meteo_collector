import {inject, injectable} from "inversify";
import {TYPES} from "../infrastructure/ioc/Types";
import {WarningRepository} from "../infrastructure/repository/WarningRepository";
import {IMGWWarningModel} from "../models/WarningModel";
import {WarningPayload} from "../payloads/WarningPayload";
import {Logger} from "winston";
import {LocationHelper} from "../helper/LocationHelper";
import {TimeHelper} from "../helper/TimeHelper";
import {Territory} from "../infrastructure/types/territory";
import {WarningsResponsePayload} from "../payloads/WarningsResponsePayload";

@injectable()
export class WarningsService {
  @inject(TYPES.WarningRepository)
  private readonly warningRepository: WarningRepository;

  @inject(TYPES.LocationHelper)
  private readonly locationHelper: LocationHelper;

  @inject(TYPES.TimeHelper)
  private readonly timeHelper: TimeHelper;

  @inject(TYPES.Logger)
  private readonly logger: Logger;

  public async getLocalWarnings(
    territory: Territory,
  ): Promise<WarningsResponsePayload> {
    const imgwWarnings = await this.getIMGWWarnings();
    const localWarnings = this.findWarningForLocation(imgwWarnings, territory);

    this.fillDuration(localWarnings);

    const warnResponse = new WarningsResponsePayload(territory, localWarnings);

    warnResponse.setEventsName(this.prepareEventsName(localWarnings));
    warnResponse.setEstimatedEndTime(localWarnings[0].getDuration());

    if (!localWarnings.length) {
      this.logger.info(`Not found warnings for given location (${territory})`);

      warnResponse.setErrorMessage(
        `Not found warnings for given location (${territory})`,
      );
    }

    return warnResponse;
  }

  private findWarningForLocation(
    warnings: IMGWWarningModel[],
    territory: Territory,
  ): WarningPayload[] {
    return warnings
      .filter((warning) =>
        warning
          .getTerritory()
          .includes(Number(this.locationHelper.getId(territory))),
      )
      .map((element) => new WarningPayload(element));
  }

  private fillDuration(warningsForGivenLocation: WarningPayload[]) {
    for (const warning of warningsForGivenLocation) {
      warning.setEstimatedEndTime(
        this.timeHelper.getDurationTime(warning.getValidTo()),
      );
    }
  }

  private prepareEventsName(warningsPayload: WarningPayload[]) {
    let tmp = "";
    if (warningsPayload.length) {
      warningsPayload.map((warning: WarningPayload) => {
        tmp += warning.getState() + ", ";
      });
    }

    return tmp.length ? tmp.substring(0, tmp.length - 2) : "Brak ostrzeżeń";
  }

  private async getIMGWWarnings(): Promise<IMGWWarningModel[]> {
    return this.warningRepository.get();
  }
}
