import { BaseRoutes } from "../../shared/routes/base.routes";
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
    const auth = this.authMiddleware.authenticate;
    const authLimit = this.rateLimitMiddleware.auth;

    this.route("post", "/auth/register", "public", authLimit, this.authController.register);
    this.route("post", "/auth/login", "public", authLimit, this.authController.login);
    this.route("post", "/auth/refresh", "public", authLimit, this.authController.refresh);
    this.route("post", "/auth/logout", "public", authLimit, this.authController.logout);
    this.route("post", "/auth/logout-all", "authenticated", auth, this.authController.logoutAll);
    this.route("get", "/auth/me", "authenticated", auth, this.authController.me);
    this.route("get", "/auth/sessions", "authenticated", auth, this.authController.getSessions);
    this.route("delete", "/auth/sessions/:id", "authenticated", auth, this.authController.revokeSession);
    this.route("patch", "/auth/me", "authenticated", auth, this.authController.updateMe);
    this.route("patch", "/auth/password", "authenticated", auth, this.authController.changePassword);
  }
}
