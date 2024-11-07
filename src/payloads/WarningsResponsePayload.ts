import {WarningPayload} from "./WarningPayload";
import {Type} from "class-transformer";
import {IsDate, IsString} from "class-validator";

export class WarningsResponsePayload {
  @IsString()
  public location: string = "";

  @IsString()
  public phenomenonName: string = "";

  @IsDate()
  public lastUpdate: Date = new Date();

  @IsString()
  public estimatedEndTime: string = "";

  @IsString()
  public errorMessage: string = "";

  @Type(() => WarningPayload)
  public warnings: WarningPayload[];

  public constructor(warningPayload: WarningPayload[]) {
    this.warnings = warningPayload;
  }

  public setLocation(location: string) {
    this.location = location;
  }

  public setEventsName(name: string) {
    this.phenomenonName = name;
  }

  public setErrorMessage(msg: string) {
    this.errorMessage = msg;
  }

  public setEstimatedEndTime(estimatedEndTime: string) {
    this.estimatedEndTime = estimatedEndTime;
  }
}
