import { Request, Response, NextFunction } from 'express';
import { Logger } from '../logger/logger.service';

const logger = new Logger('ErrorMiddleware');

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  logger.error(error.message, error.stack);

  res.status(500).json({
    status: "ERROR",
    message: "Internal server error",
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
  });
};
