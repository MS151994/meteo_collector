import {AdditionalWarningInfoPayload} from "./AdditionalWarningInfoPayload";
import {IMGWWarningModel} from "../models/WarningModel";

export class WarningPayload {
  private state: string = "no warnings";
  private readonly additionalInfo: AdditionalWarningInfoPayload =
    new AdditionalWarningInfoPayload();

  public constructor(warning?: IMGWWarningModel) {
    if (warning?.eventName) {
      this.state = warning.eventName;
      this.additionalInfo = new AdditionalWarningInfoPayload(warning);
    }
  }

  public getState() {
    return this.state;
  }

  public setState(value: string) {
    this.state = value;
  }

  public getDuration() {
    return this.additionalInfo.getEstimatedEndTime();
  }

  public setEstimatedEndTime(estimatedEndTime: string) {
    this.additionalInfo.setEstimatedEndTime(estimatedEndTime);
  }

  public getValidTo() {
    return this.additionalInfo.getValidToDate();
  }

  public getValidFrom() {
    return this.additionalInfo.getValidFromDate();
  }
}
