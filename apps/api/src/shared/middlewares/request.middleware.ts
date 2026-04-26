import { NextFunction, Request, Response } from "express";
import { environment } from "../../config/environment";
import { ApiResponse } from "../http/response";
import { Logger, LoggerFactory } from "../logger/logger.service";

export class RequestMiddleware {
  private logger: Logger;

  constructor({ loggerFactory }: { loggerFactory: LoggerFactory }) {
    this.logger = loggerFactory.create("Request");
  }

  public handle = (req: Request, res: Response, next: NextFunction): void => {
    const startedAt = process.hrtime.bigint();
    const timeout = setTimeout(() => {
      if (res.headersSent) {
        return;
      }

      const durationMs = this.getDurationMs(startedAt);
      this.logger.error(
        `${req.method} ${req.originalUrl} timed out after ${durationMs}ms`,
      );
      ApiResponse.error(res, "Request timeout", 503);
    }, environment.REQUEST_TIMEOUT_MS);

    const clearRequestTimeout = () => {
      clearTimeout(timeout);
    };

    res.on("finish", () => {
      clearRequestTimeout();
      const durationMs = this.getDurationMs(startedAt);

      if (
        durationMs < environment.SLOW_REQUEST_MS &&
        res.statusCode < 400
      ) {
        return;
      }

      const message = `${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms`;

      if (res.statusCode >= 500) {
        this.logger.error(message);
        return;
      }

      if (res.statusCode >= 400) {
        this.logger.warn(message);
        return;
      }

      this.logger.warn(`Slow request: ${message}`);
    });
    res.on("close", clearRequestTimeout);

    next();
  };

  private getDurationMs(startedAt: bigint): number {
    return Math.round(Number(process.hrtime.bigint() - startedAt) / 1_000_000);
  }
}
