import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../http/response';
import { Logger } from '../logger/logger.service';

const logger = new Logger('ErrorMiddleware');

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  logger.error(error.message, error);

  ApiResponse.error(
    res,
    "Internal server error",
    500,
    process.env.NODE_ENV === 'development' ? error.message : undefined,
  );
};
