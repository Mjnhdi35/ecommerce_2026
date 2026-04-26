import { CookieOptions, Request, Response } from "express";
import { environment } from "../../config/environment";
import { HttpError } from "../../shared/errors/http-error";
import { Controller } from "../../shared/http/controller";
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

export class AuthController extends Controller {
  private authService: AuthService;

  constructor({ authService }: { authService: AuthService }) {
    super();
    this.authService = authService;
  }

  public register = async (req: Request, res: Response): Promise<void> => {
    const payload = registerDto.parse(req.body);
    const authResult = await this.authService.register(
      payload,
      this.getSessionMetadata(req),
    );

    this.setAuthCookies(res, authResult);

    this.created(res, { user: authResult.user });
  };

  public login = async (req: Request, res: Response): Promise<void> => {
    const payload = loginDto.parse(req.body);
    const authResult = await this.authService.login(
      payload.email,
      payload.password,
      this.getSessionMetadata(req),
    );

    this.setAuthCookies(res, authResult);

    this.ok(res, { user: authResult.user });
  };

  public refresh = async (req: Request, res: Response): Promise<void> => {
    const refreshToken = this.getRefreshToken(req);
    const tokens = await this.authService.refresh(
      refreshToken,
      this.getSessionMetadata(req),
    );

    this.setAuthCookies(res, tokens);

    this.ok(res, { refreshed: true });
  };

  public logout = async (req: Request, res: Response): Promise<void> => {
    const refreshToken = this.getRefreshToken(req, false);

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    this.clearAuthCookies(res);

    this.noContent(res);
  };

  public me = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const user = await this.authService.getMe(this.userId(req));
    this.ok(res, user);
  };

  public updateMe = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    const payload = updateMeDto.parse(req.body);
    const user = await this.authService.updateMe(this.userId(req), payload);

    this.ok(res, user);
  };

  public changePassword = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    const payload = changePasswordDto.parse(req.body);
    await this.authService.changePassword(
      this.userId(req),
      payload.currentPassword,
      payload.newPassword,
    );
    this.clearAuthCookies(res);

    this.noContent(res);
  };

  public getSessions = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    const sessions = await this.authService.listSessions(this.userId(req));
    this.ok(res, sessions);
  };

  public logoutAll = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    await this.authService.logoutAll(this.userId(req));
    this.clearAuthCookies(res);

    this.noContent(res);
  };

  public revokeSession = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    await this.authService.revokeSession(
      this.userId(req),
      this.requiredParam(req, "id", "Invalid session id"),
    );

    this.noContent(res);
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

  private getSessionMetadata(req: Request) {
    return {
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    };
  }
}
