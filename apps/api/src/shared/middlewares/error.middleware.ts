import { NextFunction, Request, Response } from 'express';
import { MongoServerError } from 'mongodb';
import { z } from 'zod';
import { environment } from '../../config/environment';
import { HttpError } from '../errors/http-error';
import { ApiResponse } from '../http/response';
import { Logger, LoggerFactory } from '../logger/logger.service';

export class ErrorMiddleware {
  private logger: Logger;

  constructor({ loggerFactory }: { loggerFactory: LoggerFactory }) {
    this.logger = loggerFactory.create('ErrorMiddleware');
  }

  public handle = (
    error: Error,
    req: Request,
    res: Response,
    _next: NextFunction,
  ): void => {
    if (res.headersSent) {
      return;
    }

    if (error instanceof z.ZodError) {
      ApiResponse.error(
        res,
        "Invalid request",
        400,
        error.issues,
        "VALIDATION_ERROR",
      );
      return;
    }

    if (error instanceof HttpError) {
      this.logServerError(
        error,
        req,
        res,
        error.statusCode,
        error.errorCode || `HTTP_${error.statusCode}`,
      );
      ApiResponse.error(
        res,
        error.message,
        error.statusCode,
        undefined,
        error.errorCode,
      );
      return;
    }

    if (error instanceof MongoServerError && error.code === 11000) {
      this.logServerError(error, req, res, 409, "DUPLICATE_RESOURCE");
      ApiResponse.error(
        res,
        "Duplicate resource",
        409,
        undefined,
        "DUPLICATE_RESOURCE",
      );
      return;
    }

    if (error instanceof SyntaxError && "body" in error) {
      this.logServerError(error, req, res, 400, "INVALID_JSON_BODY");
      ApiResponse.error(
        res,
        "Invalid JSON body",
        400,
        undefined,
        "INVALID_JSON_BODY",
      );
      return;
    }

    this.logServerError(error, req, res, 500, "INTERNAL_SERVER_ERROR");
    ApiResponse.error(
      res,
      "Internal server error",
      500,
      environment.NODE_ENV === 'development' ? error.message : undefined,
      "INTERNAL_SERVER_ERROR",
    );
  };

  private logServerError(
    error: Error,
    req: Request,
    res: Response,
    statusCode: number,
    errorCode: string,
  ): void {
    if (statusCode < 500) {
      return;
    }

    this.logger.error("Unhandled request error", {
      err: error,
      errorCode,
      method: req.method,
      path: req.originalUrl,
      requestId: res.locals.requestId,
      statusCode,
    });
  }
}
