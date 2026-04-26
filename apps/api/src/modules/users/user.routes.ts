import { BaseRoutes, RouteDefinition } from "../../shared/routes/base.routes";
import { AuthMiddleware } from "../auth/auth.middleware";
import { UserController } from "./user.controller";

export class UserRoutes extends BaseRoutes {
  private authMiddleware: AuthMiddleware;
  private userController: UserController;

  constructor({
    authMiddleware,
    userController,
  }: {
    authMiddleware: AuthMiddleware;
    userController: UserController;
  }) {
    super();
    this.authMiddleware = authMiddleware;
    this.userController = userController;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.use(
      "/users",
      this.authMiddleware.authenticate,
      this.authMiddleware.requireRoles("admin"),
    );
    this.router.get(
      "/users",
      this.handle(this.userController, this.userController.getUsers),
    );
    this.router.get(
      "/users/:id",
      this.handle(this.userController, this.userController.getUserById),
    );
    this.router.post(
      "/users",
      this.handle(this.userController, this.userController.createUser),
    );
    this.router.put(
      "/users/:id",
      this.handle(this.userController, this.userController.updateUser),
    );
    this.router.patch(
      "/users/:id/role",
      this.handle(this.userController, this.userController.updateUserRole),
    );
    this.router.delete(
      "/users/:id",
      this.handle(this.userController, this.userController.deleteUser),
    );
  }

  public getRoutes(): RouteDefinition[] {
    return [
      { method: "GET", path: "/users", access: "admin" },
      { method: "GET", path: "/users/:id", access: "admin" },
      { method: "POST", path: "/users", access: "admin" },
      { method: "PUT", path: "/users/:id", access: "admin" },
      { method: "PATCH", path: "/users/:id/role", access: "admin" },
      { method: "DELETE", path: "/users/:id", access: "admin" },
    ];
  }
}
