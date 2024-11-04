import {plainToInstance} from "class-transformer";
import {validateOrReject, ValidationOptions} from "class-validator";
import {injectable} from "inversify";

@injectable()
export class Parser {
  public async parse<T>(
    model: any,
    data: any,
    validateOptions?: ValidationOptions,
  ): Promise<T> {
    let obj;
    if (data instanceof Array) {
      obj = data[0];
    } else {
      obj = data;
    }
    const raw: T = plainToInstance(model, obj) as T;

    await validateOrReject(raw as any, {
      ...validateOptions,
      whitelist: true,
      forbidUnknownValues: false,
      skipNullProperties: false,
      skipUndefinedProperties: true,
    });

    return raw as T;
  }

  public async parseMany<T>(
    model: any,
    data: any,
    validateOptions?: ValidationOptions,
  ): Promise<T[]> {
    const tmp: any[] = [];

    data.map(async (el: any) => {
      const raw = plainToInstance(model, el) as T;
      await validateOrReject(raw as any, {
        ...validateOptions,
        whitelist: true,
        forbidUnknownValues: false,
        skipNullProperties: false,
        skipUndefinedProperties: true,
      });

      tmp.push(raw);
    });

    return tmp as T[];
  }
}
