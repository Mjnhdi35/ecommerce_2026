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
    _req: Request,
    res: Response,
    _next: NextFunction,
  ): void => {
    this.logger.error(error.message, error);

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
      ApiResponse.error(
        res,
        "Invalid JSON body",
        400,
        undefined,
        "INVALID_JSON_BODY",
      );
      return;
    }

    ApiResponse.error(
      res,
      "Internal server error",
      500,
      environment.NODE_ENV === 'development' ? error.message : undefined,
      "INTERNAL_SERVER_ERROR",
    );
  };
}
