import { BaseRoutes, RouteDefinition } from "../../shared/routes/base.routes";
import { RateLimitMiddleware } from "../../shared/middlewares/rate-limit.middleware";
import { AuthController } from "./auth.controller";
import { AuthMiddleware } from "./auth.middleware";

export class AuthRoutes extends BaseRoutes {
  private authController: AuthController;
  private authMiddleware: AuthMiddleware;
  private rateLimitMiddleware: RateLimitMiddleware;

  constructor({
    authController,
    authMiddleware,
    rateLimitMiddleware,
  }: {
    authController: AuthController;
    authMiddleware: AuthMiddleware;
    rateLimitMiddleware: RateLimitMiddleware;
  }) {
    super();
    this.authController = authController;
    this.authMiddleware = authMiddleware;
    this.rateLimitMiddleware = rateLimitMiddleware;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(
      "/auth/register",
      this.rateLimitMiddleware.auth,
      this.handle(this.authController, this.authController.register),
    );
    this.router.post(
      "/auth/login",
      this.rateLimitMiddleware.auth,
      this.handle(this.authController, this.authController.login),
    );
    this.router.post(
      "/auth/refresh",
      this.rateLimitMiddleware.auth,
      this.handle(this.authController, this.authController.refresh),
    );
    this.router.post(
      "/auth/logout",
      this.rateLimitMiddleware.auth,
      this.handle(this.authController, this.authController.logout),
    );
    this.router.post(
      "/auth/logout-all",
      this.authMiddleware.authenticate,
      this.handle(this.authController, this.authController.logoutAll),
    );
    this.router.get(
      "/auth/me",
      this.authMiddleware.authenticate,
      this.handle(this.authController, this.authController.me),
    );
    this.router.get(
      "/auth/sessions",
      this.authMiddleware.authenticate,
      this.handle(this.authController, this.authController.getSessions),
    );
    this.router.delete(
      "/auth/sessions/:id",
      this.authMiddleware.authenticate,
      this.handle(this.authController, this.authController.revokeSession),
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
      { method: "POST", path: "/auth/logout-all", access: "authenticated" },
      { method: "GET", path: "/auth/me", access: "authenticated" },
      { method: "GET", path: "/auth/sessions", access: "authenticated" },
      { method: "DELETE", path: "/auth/sessions/:id", access: "authenticated" },
      { method: "PATCH", path: "/auth/me", access: "authenticated" },
      { method: "PATCH", path: "/auth/password", access: "authenticated" },
    ];
  }
}
