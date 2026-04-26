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
}
