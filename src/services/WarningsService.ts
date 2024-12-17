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

  protected readonly prefix = "[WarningsService]";

  public async getLocalWarnings(
    territory: Territory,
  ): Promise<WarningsResponsePayload> {
    const imgwWarnings: IMGWWarningModel[] = await this.getIMGWWarnings();
    const localWarnings: WarningPayload[] = this.getWarningForLocation(imgwWarnings, territory);
    this.setDurationWarningsTime(localWarnings);
    if (process.env.ENABLE_ICON === "true") {
      this.setWarningsStyles(localWarnings);
    }

    const warningsResponse: WarningsResponsePayload = new WarningsResponsePayload(localWarnings);
    warningsResponse.setLocation(
      this.locationHelper.getLocationName(territory),
    );
    warningsResponse.setEventsName(this.setPhenomenonName(localWarnings));
    warningsResponse.setEstimatedEndTime(
      this.getDurationForMaxWarning(localWarnings),
    );

    if (!localWarnings.length) {
      this.logger.warn(
        `${this.prefix} Not found warnings for given location (${territory})`,
      );

      warningsResponse.setErrorMessage(
        `${this.prefix} Not found warnings for given location (${territory})`,
      );
    }

    return warningsResponse;
  }

  private getWarningForLocation(
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

  private getDurationForMaxWarning(warnings: WarningPayload[]): string {
    if (!warnings.length) {
      return "Not available";
    }

    return warnings
      .reduce((maxWarning, currentWarning) => {
        return currentWarning.getLevel() > maxWarning.getLevel()
          ? currentWarning
          : maxWarning;
      })
      .getDuration();
  }

  private setDurationWarningsTime(warnings: WarningPayload[]): void {
    this.logger.debug(`${this.prefix} Set duration times for each warnings`);
    for (const warning of warnings) {
      warning.setEstimatedEndTime(
        this.timeHelper.getDurationTime(warning.getValidTo()),
      );
    }
  }

  private setWarningsStyles(warnings: WarningPayload[]): void {
    this.logger.debug(`${this.prefix} Set styles for each warnings`);
    for (const warning of warnings) {
      warning.setStyle(warning.getLevel());
    }
  }

  private setPhenomenonName(warnings: WarningPayload[]): string {
    this.logger.debug(`${this.prefix} Set phenomenon name for each warnings`);
    let tmp = "";
    if (warnings.length) {
      warnings.map((warning: WarningPayload) => {
        tmp += warning.getPhenomenonName() + ", ";
      });
    }

    return tmp.length ? tmp.substring(0, tmp.length - 2) : "Brak ostrzeżeń";
  }

  private async getIMGWWarnings(): Promise<IMGWWarningModel[]> {
    this.logger.info(`${this.prefix} Fetch data form IMGW`);

    return this.warningRepository.get();
  }
}
