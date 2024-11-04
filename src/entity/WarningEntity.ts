import {IsDate, IsNumber, IsString} from "class-validator";
import {Type} from "class-transformer";

export class WarningEntity {
  @IsString()
  public id: string;

  @IsString()
  public eventName: string;

  @IsDate()
  @Type(() => Date)
  public validFrom: Date;

  @IsDate()
  @Type(() => Date)
  public validUntil: Date;

  @IsDate()
  @Type(() => Date)
  public published: Date;

  @IsString()
  public content: string;

  @IsString()
  public comment: string;

  @IsNumber()
  public level: number;

  @IsNumber()
  public probability: number;
}
