import { BaseRoutes } from "../../shared/routes/base.routes";
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
    const admin = this.authMiddleware.requireRoles("admin");
    const auth = this.authMiddleware.authenticate;

    this.route("get", "/users", "admin", auth, admin, this.userController.getUsers);
    this.route("get", "/users/:id", "admin", auth, admin, this.userController.getUserById);
    this.route("post", "/users", "admin", auth, admin, this.userController.createUser);
    this.route("put", "/users/:id", "admin", auth, admin, this.userController.updateUser);
    this.route("patch", "/users/:id/role", "admin", auth, admin, this.userController.updateUserRole);
    this.route("delete", "/users/:id", "admin", auth, admin, this.userController.deleteUser);
  }
}
