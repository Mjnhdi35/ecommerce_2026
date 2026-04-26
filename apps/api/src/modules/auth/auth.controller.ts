import { Request, Response } from "express";
import { z } from "zod";
import { HttpError } from "../../shared/errors/http-error";
import { ApiResponse } from "../../shared/http/response";
import { AuthenticatedRequest } from "./auth.middleware";
import { AuthService } from "./auth.service";

const authUserSchema = z.object({
  username: z.string().trim().min(1),
  email: z.email().trim(),
  password: z.string().min(6),
});

const loginSchema = authUserSchema.pick({
  email: true,
  password: true,
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export class AuthController {
  private authService: AuthService;

  constructor({ authService }: { authService: AuthService }) {
    this.authService = authService;
  }

  public register = async (req: Request, res: Response): Promise<void> => {
    const payload = authUserSchema.parse(req.body);
    const authResult = await this.authService.register(payload);

    ApiResponse.success(res, authResult, 201);
  };

  public login = async (req: Request, res: Response): Promise<void> => {
    const payload = loginSchema.parse(req.body);
    const authResult = await this.authService.login(payload.email, payload.password);

    ApiResponse.success(res, authResult);
  };

  public refresh = async (req: Request, res: Response): Promise<void> => {
    const payload = refreshTokenSchema.parse(req.body);
    const tokens = await this.authService.refresh(payload.refreshToken);

    ApiResponse.success(res, tokens);
  };

  public logout = async (req: Request, res: Response): Promise<void> => {
    const payload = refreshTokenSchema.parse(req.body);
    await this.authService.logout(payload.refreshToken);

    ApiResponse.noContent(res);
  };

  public me = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    ApiResponse.success(res, req.user);
  };

  public handleError = (error: unknown, res: Response): void => {
    if (error instanceof z.ZodError) {
      ApiResponse.error(res, "Invalid request body", 400, error.issues);
      return;
    }

    if (error instanceof HttpError) {
      ApiResponse.error(res, error.message, error.statusCode);
      return;
    }

    throw error;
  };
}
