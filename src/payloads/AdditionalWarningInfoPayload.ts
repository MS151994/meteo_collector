import {IMGWWarningModel} from "../models/WarningModel";

export class AdditionalWarningInfoPayload {
  private readonly level: number = 0;
  private readonly probability: number = 0;
  private readonly validTo: Date | null = null;
  private readonly validFrom: Date | null = null;
  private estimatedEndTime: string = "Not available";
  private readonly published: Date | null = null;
  private readonly content: string = "";
  private readonly comment: string = "";

  public constructor(payload?: IMGWWarningModel) {
    if (payload?.level) {
      this.level = payload.level;
    }
    if (payload?.probability) {
      this.probability = payload.probability;
    }

    if (payload?.validTo) {
      this.validTo = new Date(payload.validTo);
    }

    if (payload?.validFrom) {
      this.validFrom = new Date(payload.validFrom);
    }

    if (payload?.published) {
      this.published = new Date(payload.published);
    }

    if (payload?.content) {
      this.content = payload.content;
    }

    if (payload?.comment) {
      this.comment = payload.comment;
    }
  }

  public getLevel(): number {
    return this.level;
  }

  public getProbability(): number {
    return this.probability;
  }

  public getEstimatedEndTime(): string {
    return this.estimatedEndTime;
  }

  public getComment(): string {
    return this.comment;
  }

  public getContent(): string {
    return this.content;
  }

  public getPublishDate(): Date | null {
    return this.published;
  }

  public getValidFromDate() {
    return this.validFrom;
  }

  public getValidToDate() {
    return this.validTo;
  }

  public setEstimatedEndTime(estimatedEndTime: string) {
    this.estimatedEndTime = estimatedEndTime;
  }
}
