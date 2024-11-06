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
      return Number(TerritoryEnum[location as keyof typeof TerritoryEnum]);
    }

    return `Location ID for '${location}' not found`;
  }

  public getLocationName(location: Territory): string {
    let territory = location;
    if (typeof location === "string") {
      if (!(location in TerritoryEnum)) {
        territory = `Not found location for given territory: ${location}`;
      }
    } else {
      const entry = Object.entries(TerritoryEnum).find(
        ([key, value]) => value === String(location),
      );

      territory = entry
        ? entry[0]
        : `Not found location for given id: ${location}`;
    }

    return String(territory);
  }
}
