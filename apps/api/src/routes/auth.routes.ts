import { NextFunction, Request, Response, Router } from "express";
import { container } from "../container";
import { AuthController } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";

export class AuthRoutes {
  private router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post("/auth/register", this.register);
    this.router.post("/auth/login", this.login);
    this.router.post("/auth/refresh", this.refresh);
    this.router.post("/auth/logout", this.logout);
    this.router.get("/auth/me", authenticate, this.me);
  }

  private register = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    await this.handle(req, res, next, (controller) =>
      controller.register(req, res),
    );
  };

  private login = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    await this.handle(req, res, next, (controller) =>
      controller.login(req, res),
    );
  };

  private refresh = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    await this.handle(req, res, next, (controller) =>
      controller.refresh(req, res),
    );
  };

  private logout = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    await this.handle(req, res, next, (controller) =>
      controller.logout(req, res),
    );
  };

  private me = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    await this.handle(req, res, next, (controller) => controller.me(req, res));
  };

  private async handle(
    _req: Request,
    res: Response,
    next: NextFunction,
    action: (controller: AuthController) => Promise<void>,
  ): Promise<void> {
    const authController = container.resolve<AuthController>("authController");

    try {
      await action(authController);
    } catch (error) {
      try {
        authController.handleError(error, res);
      } catch (unhandledError) {
        next(unhandledError);
      }
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
