import { BaseRoutes, RouteDefinition } from "../../shared/routes/base.routes";
import { AuthController } from "./auth.controller";
import { AuthMiddleware } from "./auth.middleware";

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
    this.router.patch(
      "/auth/me",
      this.authMiddleware.authenticate,
      this.handle(this.authController, this.authController.updateMe),
    );
    this.router.patch(
      "/auth/password",
      this.authMiddleware.authenticate,
      this.handle(this.authController, this.authController.changePassword),
    );
  }

  public getRoutes(): RouteDefinition[] {
    return [
      { method: "POST", path: "/auth/register", access: "public" },
      { method: "POST", path: "/auth/login", access: "public" },
      { method: "POST", path: "/auth/refresh", access: "public" },
      { method: "POST", path: "/auth/logout", access: "public" },
      { method: "GET", path: "/auth/me", access: "authenticated" },
      { method: "PATCH", path: "/auth/me", access: "authenticated" },
      { method: "PATCH", path: "/auth/password", access: "authenticated" },
    ];
  }
}
