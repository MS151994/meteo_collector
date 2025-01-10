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

  public getWarnings(): WarningPayload[] {
    return this.warnings;
  }

  public setWarnings(warningPayload: WarningPayload[]): this {
    this.warnings = warningPayload;

    return this;
  }

  public setLocation(location: string): this {
    this.location = location;

    return this;
  }

  public setEventsName(name: string): this {
    this.phenomenonName = name;

    return this;
  }

  public setErrorMessage(msg: string): this {
    this.errorMessage = msg;

    return this;
  }

  public setEstimatedEndTime(estimatedEndTime: string): this {
    this.estimatedEndTime = estimatedEndTime;

    return this;
  }
}
