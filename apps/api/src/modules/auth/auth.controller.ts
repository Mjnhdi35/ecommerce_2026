import { Request, Response } from "express";
import { z } from "zod";
import { HttpError } from "../../shared/errors/http-error";
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

    res.status(201).json({
      status: "OK",
      data: authResult,
    });
  };

  public login = async (req: Request, res: Response): Promise<void> => {
    const payload = loginSchema.parse(req.body);
    const authResult = await this.authService.login(payload.email, payload.password);

    res.json({
      status: "OK",
      data: authResult,
    });
  };

  public refresh = async (req: Request, res: Response): Promise<void> => {
    const payload = refreshTokenSchema.parse(req.body);
    const tokens = await this.authService.refresh(payload.refreshToken);

    res.json({
      status: "OK",
      data: tokens,
    });
  };

  public logout = async (req: Request, res: Response): Promise<void> => {
    const payload = refreshTokenSchema.parse(req.body);
    await this.authService.logout(payload.refreshToken);

    res.status(204).send();
  };

  public me = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    res.json({
      status: "OK",
      data: req.user,
    });
  };

  public handleError = (error: unknown, res: Response): void => {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        status: "ERROR",
        message: "Invalid request body",
        errors: error.issues,
      });
      return;
    }

    if (error instanceof HttpError) {
      res.status(error.statusCode).json({
        status: "ERROR",
        message: error.message,
      });
      return;
    }

    throw error;
  };
}
