import { NextFunction, Request, Response } from "express";
import { HttpError } from "../../shared/errors/http-error";
import { ApiResponse } from "../../shared/http/response";
import { AuthService, AuthUser } from "./auth.service";
import { UserRole } from "../users/user.model";

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export class AuthMiddleware {
  private authService: AuthService;

  constructor({ authService }: { authService: AuthService }) {
    this.authService = authService;
  }

  public authenticate = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): void => {
    void this.authenticateRequest(req, res, next);
  };

  private authenticateRequest = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authorization = req.headers.authorization;
      const cookieToken = this.getCookieAccessToken(req);
      const bearerToken = authorization?.startsWith("Bearer ")
        ? authorization.slice("Bearer ".length)
        : undefined;
      const token = cookieToken || bearerToken;

      if (!token) {
        throw new HttpError(401, "Access token is required");
      }

      req.user = await this.authService.authenticateAccessToken(token);
      next();
    } catch (error) {
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

      ApiResponse.error(
        res,
        "Invalid access token",
        401,
        undefined,
        "AUTH_INVALID_ACCESS_TOKEN",
      );
    }
  };

  public requireRoles = (...roles: UserRole[]) => {
    return (
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction,
    ): void => {
      if (!req.user) {
        ApiResponse.error(
          res,
          "Authentication is required",
          401,
          undefined,
          "AUTH_REQUIRED",
        );
        return;
      }

      if (!roles.includes(req.user.role)) {
        ApiResponse.error(res, "Forbidden", 403, undefined, "FORBIDDEN");
        return;
      }

      next();
    };
  };

  private getCookieAccessToken(req: Request): string | undefined {
    const cookies = req.cookies as Record<string, unknown> | undefined;
    const accessToken = cookies?.accessToken;

    return typeof accessToken === "string" && accessToken.length > 0
      ? accessToken
      : undefined;
  }
}
