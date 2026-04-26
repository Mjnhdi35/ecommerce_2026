import { NextFunction, Request, Response } from "express";
import { HttpError } from "../../shared/errors/http-error";
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
        res.status(error.statusCode).json({
          status: "ERROR",
          message: error.message,
        });
        return;
      }

      res.status(401).json({
        status: "ERROR",
        message: "Invalid access token",
      });
    }
  };
}
