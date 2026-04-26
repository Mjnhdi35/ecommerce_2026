export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly errorCode?: string,
  ) {
    super(message);
  }
}
