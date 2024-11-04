import {WarningPayload} from "./WarningPayload";
import {Type} from "class-transformer";
import {IsDate, IsString} from "class-validator";
import {Territory} from "../infrastructure/types/territory";

export class WarningsResponsePayload {
  @IsString()
  public location: Territory;

  @IsString()
  public eventName: string = "";

  @IsDate()
  public lastUpdate: Date = new Date();

  @IsString()
  public estimatedEndTime: string = "";

  @IsString()
  public errorMessage: string = "";

  @Type(() => WarningPayload)
  public warnings: WarningPayload[];

  public constructor(
    location: string | number,
    warningPayload: WarningPayload[],
  ) {
    this.location = location;
    this.warnings = warningPayload;
  }

  public setEventsName(name: string) {
    this.eventName = name;
  }

  public setErrorMessage(msg: string) {
    this.errorMessage = msg;
  }

  public setEstimatedEndTime(estimatedEndTime: string) {
    this.estimatedEndTime = estimatedEndTime;
  }
}
