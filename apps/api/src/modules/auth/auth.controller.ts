import { Request, Response } from "express";
import { z } from "zod";
import { HttpError } from "../../shared/errors/http-error";
import { ApiResponse } from "../../shared/http/response";
import {
  changePasswordDto,
  loginDto,
  refreshTokenDto,
  registerDto,
  updateMeDto,
} from "./auth.dto";
import { AuthenticatedRequest } from "./auth.middleware";
import { AuthService } from "./auth.service";

export class AuthController {
  private authService: AuthService;

  constructor({ authService }: { authService: AuthService }) {
    this.authService = authService;
  }

  public register = async (req: Request, res: Response): Promise<void> => {
    const payload = registerDto.parse(req.body);
    const authResult = await this.authService.register(payload);

    ApiResponse.success(res, authResult, 201);
  };

  public login = async (req: Request, res: Response): Promise<void> => {
    const payload = loginDto.parse(req.body);
    const authResult = await this.authService.login(payload.email, payload.password);

    ApiResponse.success(res, authResult);
  };

  public refresh = async (req: Request, res: Response): Promise<void> => {
    const payload = refreshTokenDto.parse(req.body);
    const tokens = await this.authService.refresh(payload.refreshToken);

    ApiResponse.success(res, tokens);
  };

  public logout = async (req: Request, res: Response): Promise<void> => {
    const payload = refreshTokenDto.parse(req.body);
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

    const payload = updateMeDto.parse(req.body);
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

    const payload = changePasswordDto.parse(req.body);
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
