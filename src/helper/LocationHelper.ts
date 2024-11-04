import {TerritoryEnum} from "../infrastructure/enum/TerritoryEnum";
import {inject, injectable} from "inversify";
import {TYPES} from "../infrastructure/ioc/Types";
import {Logger} from "winston";
import {Territory} from "../infrastructure/types/territory";

@injectable()
export class LocationHelper {
  @inject(TYPES.Logger)
  private readonly logger: Logger;

  public getId(location: Territory): Territory {
    if (typeof location === "number") {
      return location;
    }
    if (location in TerritoryEnum) {
      return String(TerritoryEnum[location as keyof typeof TerritoryEnum]);
    }
    this.logger.warn(
      `Not found location ID for given ${location}, please check input or update enum file`,
    );

    return `Location ID for '${location}' not found`;
  }
}
