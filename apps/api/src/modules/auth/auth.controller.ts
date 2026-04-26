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

const updateMeSchema = z.object({
  username: z.string().trim().min(1).optional(),
  email: z.email().trim().optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field is required" },
);

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
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
    if (!req.user) {
      throw new HttpError(401, "Authentication is required");
    }

    const user = await this.authService.getMe(req.user.id);
    ApiResponse.success(res, user);
  };

  public updateMe = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    if (!req.user) {
      throw new HttpError(401, "Authentication is required");
    }

    const payload = updateMeSchema.parse(req.body);
    const user = await this.authService.updateMe(req.user.id, payload);

    ApiResponse.success(res, user);
  };

  public changePassword = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    if (!req.user) {
      throw new HttpError(401, "Authentication is required");
    }

    const payload = changePasswordSchema.parse(req.body);
    await this.authService.changePassword(
      req.user.id,
      payload.currentPassword,
      payload.newPassword,
    );

    ApiResponse.noContent(res);
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
