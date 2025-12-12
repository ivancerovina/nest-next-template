type TErrorParams = {
  message: string;
  errorCode: string;
  statusCode: number;
};

export class HttpError extends Error {
  public readonly errorCode: string;
  public readonly statusCode: number;

  public constructor(params: TErrorParams) {
    super(params.message);
    this.name = "HttpError";
    this.errorCode = params.errorCode;
    this.statusCode = params.statusCode;
  }
}
