import { CookieOptions, Request, Response } from "express";
import { z } from "zod";
import { environment } from "../../config/environment";
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
import { AuthService, AuthTokens } from "./auth.service";

const ACCESS_TOKEN_COOKIE_NAME = "accessToken";
const REFRESH_TOKEN_COOKIE_NAME = "refreshToken";
const ACCESS_TOKEN_MAX_AGE_MS = 15 * 60 * 1000;
const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export class AuthController {
  private authService: AuthService;

  constructor({ authService }: { authService: AuthService }) {
    this.authService = authService;
  }

  public register = async (req: Request, res: Response): Promise<void> => {
    const payload = registerDto.parse(req.body);
    const authResult = await this.authService.register(payload);

    this.setAuthCookies(res, authResult);

    ApiResponse.success(res, { user: authResult.user }, 201);
  };

  public login = async (req: Request, res: Response): Promise<void> => {
    const payload = loginDto.parse(req.body);
    const authResult = await this.authService.login(payload.email, payload.password);

    this.setAuthCookies(res, authResult);

    ApiResponse.success(res, { user: authResult.user });
  };

  public refresh = async (req: Request, res: Response): Promise<void> => {
    const refreshToken = this.getRefreshToken(req);
    const tokens = await this.authService.refresh(refreshToken);

    this.setAuthCookies(res, tokens);

    ApiResponse.success(res, { refreshed: true });
  };

  public logout = async (req: Request, res: Response): Promise<void> => {
    const refreshToken = this.getRefreshToken(req, false);

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    this.clearAuthCookies(res);

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
    this.clearAuthCookies(res);

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

  private getRefreshToken(req: Request, required = true): string {
    const cookieToken = this.getCookieValue(req, REFRESH_TOKEN_COOKIE_NAME);

    if (cookieToken) {
      return cookieToken;
    }

    const parsedBody = refreshTokenDto.safeParse(req.body);

    if (parsedBody.success) {
      return parsedBody.data.refreshToken;
    }

    if (!required) {
      return "";
    }

    throw new HttpError(401, "Refresh token is required");
  }

  private getCookieValue(req: Request, cookieName: string): string | undefined {
    const cookies = req.cookies as Record<string, unknown> | undefined;
    const value = cookies?.[cookieName];

    return typeof value === "string" && value.length > 0 ? value : undefined;
  }

  private setAuthCookies(res: Response, tokens: AuthTokens): void {
    res.cookie(ACCESS_TOKEN_COOKIE_NAME, tokens.accessToken, {
      ...this.getBaseCookieOptions(),
      maxAge: ACCESS_TOKEN_MAX_AGE_MS,
    });
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, tokens.refreshToken, {
      ...this.getBaseCookieOptions(),
      maxAge: REFRESH_TOKEN_MAX_AGE_MS,
    });
  }

  private clearAuthCookies(res: Response): void {
    res.clearCookie(ACCESS_TOKEN_COOKIE_NAME, this.getBaseCookieOptions());
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, this.getBaseCookieOptions());
  }

  private getBaseCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: environment.NODE_ENV === "production",
    };
  }
}
