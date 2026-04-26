import crypto from "crypto";
import { CookieOptions, NextFunction, Request, Response } from "express";
import { environment } from "../../config/environment";
import { ApiResponse } from "../http/response";

const CSRF_COOKIE_NAME = "csrfToken";
const CSRF_HEADER_NAME = "x-csrf-token";
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export class CsrfMiddleware {
  public issueToken = (_req: Request, res: Response): void => {
    const token = crypto.randomBytes(32).toString("hex");
    const cookieValue = `${token}.${this.signToken(token)}`;

    res.cookie(CSRF_COOKIE_NAME, cookieValue, this.getCookieOptions());
    ApiResponse.success(res, { csrfToken: token });
  };

  public verify = (req: Request, res: Response, next: NextFunction): void => {
    if (SAFE_METHODS.has(req.method)) {
      next();
      return;
    }

    const cookieToken = this.getCookieToken(req);
    const headerToken = req.headers[CSRF_HEADER_NAME];

    if (
      !cookieToken ||
      typeof headerToken !== "string" ||
      !this.isValidToken(cookieToken, headerToken)
    ) {
      ApiResponse.error(
        res,
        "Invalid CSRF token",
        403,
        undefined,
        "CSRF_INVALID_TOKEN",
      );
      return;
    }

    next();
  };

  private getCookieToken(req: Request): string | undefined {
    const cookies = req.cookies as Record<string, unknown> | undefined;
    const value = cookies?.[CSRF_COOKIE_NAME];

    return typeof value === "string" ? value : undefined;
  }

  private isValidToken(cookieToken: string, headerToken: string): boolean {
    const [token, signature] = cookieToken.split(".");

    if (!token || !signature || token !== headerToken) {
      return false;
    }

    return this.safeEqual(signature, this.signToken(token));
  }

  private signToken(token: string): string {
    return crypto
      .createHmac("sha256", environment.CSRF_SECRET)
      .update(token)
      .digest("hex");
  }

  private safeEqual(left: string, right: string): boolean {
    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);

    return (
      leftBuffer.length === rightBuffer.length &&
      crypto.timingSafeEqual(leftBuffer, rightBuffer)
    );
  }

  private getCookieOptions(): CookieOptions {
    return {
      httpOnly: false,
      path: environment.API_PREFIX,
      sameSite: "lax",
      secure: environment.NODE_ENV === "production",
    };
  }
}
