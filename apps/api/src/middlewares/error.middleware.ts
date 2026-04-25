import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(error.stack);

  res.status(500).json({
    status: "ERROR",
    message: "Internal server error",
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
  });
};