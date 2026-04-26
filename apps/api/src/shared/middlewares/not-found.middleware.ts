import { NextFunction, Request, Response } from 'express';
import { ApiResponse } from '../http/response';

export class NotFoundMiddleware {
  public handle = (req: Request, res: Response, _next: NextFunction): void => {
    ApiResponse.error(
      res,
      "Route not found",
      404,
      {
        path: req.originalUrl,
      },
      "ROUTE_NOT_FOUND",
    );
  };
}
