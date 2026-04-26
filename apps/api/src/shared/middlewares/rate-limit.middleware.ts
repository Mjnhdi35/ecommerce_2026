import { RequestHandler } from "express";
import rateLimit from "express-rate-limit";
import { environment } from "../../config/environment";
import { ApiResponse } from "../http/response";

export class RateLimitMiddleware {
  public readonly auth: RequestHandler;

  constructor() {
    this.auth = rateLimit({
      windowMs: environment.AUTH_RATE_LIMIT_WINDOW_MS,
      limit: environment.AUTH_RATE_LIMIT_MAX,
      standardHeaders: "draft-7",
      legacyHeaders: false,
      handler: (_req, res) => {
        ApiResponse.error(
          res,
          "Too many requests",
          429,
          undefined,
          "RATE_LIMIT_EXCEEDED",
        );
      },
    });
  }
}
