import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../http/response';

export const notFound = (req: Request, res: Response, _next: NextFunction) => {
  ApiResponse.error(res, "Route not found", 404, {
    path: req.originalUrl,
  });
};
