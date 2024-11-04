export class HttpClientError extends Error {
  private readonly statusCode: number;

  public constructor(msg: string, statusCode: number) {
    super(msg);
    this.statusCode = statusCode;

    Object.setPrototypeOf(this, HttpClientError.prototype);
  }
}
