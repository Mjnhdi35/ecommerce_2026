import { NextFunction, Request, Response } from 'express';
import { ApiResponse } from '../http/response';
import { Logger, LoggerFactory } from '../logger/logger.service';

export class ErrorMiddleware {
  private logger: Logger;

  constructor({ loggerFactory }: { loggerFactory: LoggerFactory }) {
    this.logger = loggerFactory.create('ErrorMiddleware');
  }

  public handle = (
    error: Error,
    _req: Request,
    res: Response,
  _next: NextFunction,
): void => {
  this.logger.error(error.message, error);

  if (res.headersSent) {
    return;
  }

  ApiResponse.error(
      res,
      "Internal server error",
      500,
      process.env.NODE_ENV === 'development' ? error.message : undefined,
    );
  };
}
