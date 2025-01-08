import {AdditionalWarningInfoPayload} from './AdditionalWarningInfoPayload';
import {IMGWWarningModel} from '../models/WarningModel';
import {WarningStyle} from './WarningStyle';

export class WarningPayload {
  private phenomenonName: string = 'no warnings';
  private readonly additionalInfo: AdditionalWarningInfoPayload =
    new AdditionalWarningInfoPayload();
  private style: WarningStyle;

  public constructor(warning?: IMGWWarningModel) {
    if (warning?.eventName) {
      this.phenomenonName = warning.eventName;
      this.additionalInfo = new AdditionalWarningInfoPayload(warning);
    }
  }

  public setPhenomenonName(value: string): void {
    this.phenomenonName = value;
  }

  public setStyle(level: number): void {
    this.style = new WarningStyle(level);
  }

  public setEstimatedEndTime(estimatedEndTime: string) {
    this.additionalInfo.setEstimatedEndTime(estimatedEndTime);
  }

  public getDuration(): string {
    return this.additionalInfo.getEstimatedEndTime();
  }

  public getValidTo(): Date | null {
    return this.additionalInfo.getValidToDate();
  }

  public getValidFrom(): Date | null {
    return this.additionalInfo.getValidFromDate();
  }

  public getLevel(): number {
    return this.additionalInfo.getLevel();
  }

  public getPhenomenonName(): string {
    return this.phenomenonName;
  }
}
