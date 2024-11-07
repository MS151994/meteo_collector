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
  protected readonly prefix = "[HttpClient]";

  protected defaultOptions: Options = {
    followRedirect: false,
    timeout: 5000,
    throwHttpErrors: true,
  };

  protected readonly url = process.env.IMGW_API_URL;

  public async execute(): Promise<HttpResponseInterface> {
    try {
      this.logger.debug(`${this.prefix} Trying to fetch data from ${this.url}`);
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

      this.logger.debug(
        `${this.prefix} Successfully fetched data (${res.statusCode})`,
      );

      return response;
    } catch (error: any) {
      this.logger.error(
        `${this.prefix} Request to IMGW meteo failed with code: ${error.code}`,
      );
      throw new HttpClientError(
        `${this.prefix} Request failed with code: ${error.code}`,
        error.code,
      );
    }
  }
}
