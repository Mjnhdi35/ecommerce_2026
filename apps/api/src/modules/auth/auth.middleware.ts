import { NextFunction, Request, Response } from "express";
import { HttpError } from "../../shared/errors/http-error";
import { ApiResponse } from "../../shared/http/response";
import { AuthService, AuthUser } from "./auth.service";

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
  ) => {
    try {
      const authorization = req.headers.authorization;

      if (!authorization?.startsWith("Bearer ")) {
        throw new HttpError(401, "Access token is required");
      }

      const token = authorization.slice("Bearer ".length);
      req.user = this.authService.verifyAccessToken(token);
      next();
    } catch (error) {
      if (error instanceof HttpError) {
        ApiResponse.error(res, error.message, error.statusCode);
        return;
      }

      ApiResponse.error(res, "Invalid access token", 401);
    }
  };
}
