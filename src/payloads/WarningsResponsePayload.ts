import {WarningPayload} from './WarningPayload';
import {Type} from 'class-transformer';
import {IsDate, IsString} from 'class-validator';

export class WarningsResponsePayload {
  @IsString()
  public location: string = '';

  @IsString()
  public phenomenonName: string = '';

  @IsDate()
  public lastUpdate: Date = new Date();

  @IsString()
  public estimatedEndTime: string = '';

  @IsString()
  public errorMessage: string = '';

  @Type((): typeof WarningPayload => WarningPayload)
  public warnings: WarningPayload[];

  public constructor(warningPayload: WarningPayload[]) {
    this.warnings = warningPayload;
  }

  public setLocation(location: string): void {
    this.location = location;
  }

  public setEventsName(name: string): void {
    this.phenomenonName = name;
  }

  public setErrorMessage(msg: string): void {
    this.errorMessage = msg;
  }

  public setEstimatedEndTime(estimatedEndTime: string): void {
    this.estimatedEndTime = estimatedEndTime;
  }
}
