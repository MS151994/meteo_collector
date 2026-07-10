import {IsDate, IsEnum, IsNotEmpty, IsOptional, IsString} from 'class-validator';
import {SeverityType} from '../infrastructure/enum/SeverityType';
import {PriorityType} from '../infrastructure/enum/PriorityType';
import {LabelType} from '../infrastructure/enum/LabelType';

export interface NotificationPayloadInit {
  type: string;
  title: string;
  message: string;
  severity: SeverityType;
  description?: string;
  priority?: PriorityType;
  createdAt?: Date;
  label?: LabelType;
}

export class NotificationPayload {
  @IsNotEmpty()
  @IsString()
  public type: string;

  @IsNotEmpty()
  @IsString()
  public title: string;

  @IsNotEmpty()
  @IsString()
  public message: string;

  @IsOptional()
  @IsString()
  public description?: string;

  @IsNotEmpty()
  @IsEnum(SeverityType)
  public severity: SeverityType;

  @IsOptional()
  @IsEnum(PriorityType)
  public priority?: PriorityType;

  @IsOptional()
  @IsDate()
  public createdAt?: Date;

  @IsOptional()
  @IsEnum(LabelType)
  public label?: LabelType;

  public constructor(init: NotificationPayloadInit) {
    Object.assign(this, init);
  }

  public toForm(): Record<string, string> {
    const form: Record<string, string> = {};
    for (const [key, value] of Object.entries(this)) {
      if (value === undefined || value === null) {
        continue;
      }
      form[key] = value instanceof Date ? value.toISOString() : String(value);
    }

    return form;
  }
}
