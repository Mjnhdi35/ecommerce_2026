import { NextFunction, Request, Response } from "express";
import { container } from "../container";
import { AuthService, AuthUser } from "../services/auth.service";
import { HttpError } from "../services/user.service";

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export const authenticate = (
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
    const authService = container.resolve<AuthService>("authService");
    req.user = authService.verifyAccessToken(token);
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
