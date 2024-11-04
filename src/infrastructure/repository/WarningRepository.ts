import { inject, injectable } from "inversify";
import { TYPES } from "../ioc/Types";
import { HttpClient } from "../http/HttpClient";
import { IMGWWarningModel } from "../../models/WarningModel";
import { HttpResponseInterface } from "../http/HttpResponseInterface";
import { Logger } from "winston";

@injectable()
export class WarningRepository {
  @inject(TYPES.HttpClient)
  private readonly httpClient: HttpClient;

  @inject(TYPES.Logger)
  private readonly logger: Logger;

  public async get(): Promise<IMGWWarningModel[]> {
    const warnings: IMGWWarningModel[] = [];
    try {
      const response: HttpResponseInterface = await this.httpClient.execute();

      if (response.body.length) {
        response.body.map((warning: any) => {
          warnings.push(new IMGWWarningModel(warning));
        });
      }

      return warnings;
    } catch (err) {
      this.logger.warn(
        `Not found warnings in IMGW meteo. error: ${(err as Error).message}`,
      );

      return warnings;
    }
  }
}
