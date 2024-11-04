import got, { Options } from "got";
import { HttpResponseInterface } from "./HttpResponseInterface";
import { inject, injectable } from "inversify";
import { TYPES } from "../ioc/Types";
import { Logger } from "winston";
import { HttpClientError } from "../errors/HttpClientError";

@injectable()
export class HttpClient {
  @inject(TYPES.Logger)
  private readonly logger: Logger;

  protected defaultOptions: Options = {
    followRedirect: false,
    timeout: 5000,
    throwHttpErrors: true,
  };

  protected readonly url =
    "https://danepubliczne.imgw.pl/api/data/warningsmeteo";

  public async execute(): Promise<HttpResponseInterface> {
    try {
      let response: HttpResponseInterface = {};

      const res = (await got({
        ...this.defaultOptions,
        url: this.url,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })) as HttpResponseInterface;

      response.body = JSON.parse(res.body);
      response.statusCode = res.statusCode;
      response.headers = res.headers;

      return response;
    } catch (error: any) {
      this.logger.error(
        `Request to IMGW meteo failed with code: ${error.code}`,
      );
      throw new HttpClientError(
        `Request failed with code: ${error.code}`,
        error.code,
      );
    }
  }
}
