import crypto from "crypto";
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
    const requestId = this.getRequestId(req);
    const startedAt = process.hrtime.bigint();

    res.locals.requestId = requestId;
    res.setHeader("X-Request-Id", requestId);

    const timeout = setTimeout(() => {
      if (res.headersSent) {
        return;
      }

      const durationMs = this.getDurationMs(startedAt);
      this.logger.error("Request timed out", this.getLogFields(req, {
        durationMs,
        requestId,
        statusCode: 503,
      }));
      ApiResponse.error(
        res,
        "Request timeout",
        503,
        undefined,
        "REQUEST_TIMEOUT",
      );
    }, environment.REQUEST_TIMEOUT_MS);

    let logged = false;
    const clearRequestTimeout = () => {
      clearTimeout(timeout);
    };

    const logRequest = (closedEarly = false) => {
      if (logged) {
        return;
      }

      logged = true;
      clearRequestTimeout();
      const durationMs = this.getDurationMs(startedAt);
      const statusCode = closedEarly && !res.writableEnded ? 499 : res.statusCode;
      const fields = this.getLogFields(req, {
        closedEarly,
        durationMs,
        requestId,
        statusCode,
      });

      if (
        durationMs < environment.SLOW_REQUEST_MS &&
        statusCode < 400
      ) {
        return;
      }

      if (statusCode >= 500 || statusCode === 499) {
        this.logger.error("Request failed", fields);
        return;
      }

      if (statusCode >= 400) {
        this.logger.warn("Request rejected", fields);
        return;
      }

      this.logger.warn("Slow request", fields);
    };

    res.once("finish", () => logRequest());
    res.once("close", () => logRequest(true));

    next();
  };

  private getDurationMs(startedAt: bigint): number {
    return Math.round(Number(process.hrtime.bigint() - startedAt) / 1_000_000);
  }

  private getRequestId(req: Request): string {
    const incomingRequestId = req.headers["x-request-id"];

    if (
      typeof incomingRequestId === "string" &&
      incomingRequestId.length > 0 &&
      incomingRequestId.length <= 128
    ) {
      return incomingRequestId;
    }

    return crypto.randomUUID();
  }

  private getLogFields(
    req: Request,
    fields: {
      closedEarly?: boolean;
      durationMs: number;
      requestId: string;
      statusCode: number;
    },
  ): Record<string, unknown> {
    return {
      ...fields,
      method: req.method,
      path: req.originalUrl,
    };
  }
}
