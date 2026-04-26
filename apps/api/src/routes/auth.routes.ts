import { AuthController } from "../controllers/auth.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { BaseRoutes } from "./base.routes";

export class AuthRoutes extends BaseRoutes {
  private authController: AuthController;
  private authMiddleware: AuthMiddleware;

  constructor({
    authController,
    authMiddleware,
  }: {
    authController: AuthController;
    authMiddleware: AuthMiddleware;
  }) {
    super();
    this.authController = authController;
    this.authMiddleware = authMiddleware;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(
      "/auth/register",
      this.handle(this.authController, this.authController.register),
    );
    this.router.post(
      "/auth/login",
      this.handle(this.authController, this.authController.login),
    );
    this.router.post(
      "/auth/refresh",
      this.handle(this.authController, this.authController.refresh),
    );
    this.router.post(
      "/auth/logout",
      this.handle(this.authController, this.authController.logout),
    );
    this.router.get(
      "/auth/me",
      this.authMiddleware.authenticate,
      this.handle(this.authController, this.authController.me),
    );
  }
}
