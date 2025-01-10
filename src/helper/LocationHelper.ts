import {TerritoryEnum} from '../infrastructure/enum/TerritoryEnum';
import {injectable} from 'inversify';
import {Territory} from '../infrastructure/types/territory';

@injectable()
export class LocationHelper {
  public getId(location: Territory): Territory {
    if (typeof location === 'number') {
      return location;
    }
    if (location in TerritoryEnum) {
      return Number(TerritoryEnum[location as keyof typeof TerritoryEnum]);
    }

    return `Location ID for '${location}' not found`;
  }

  public getLocationName(location: Territory): string {
    let territory: Territory = location;
    if (typeof location === 'string') {
      if (!(location in TerritoryEnum)) {
        territory = `Not found location for given territory: ${location}`;
      }
    } else {
      const entry: [string, TerritoryEnum] | undefined = Object.entries(TerritoryEnum).find(
        ([key, value]: [string, TerritoryEnum]): boolean => value === String(location),
      );

      territory = entry ? entry[0] : `Not found location for given id: ${location}`;
    }

    return String(territory);
  }
}
