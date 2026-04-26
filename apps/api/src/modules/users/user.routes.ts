import { BaseRoutes } from "../../shared/routes/base.routes";
import { UserController } from "./user.controller";

export class UserRoutes extends BaseRoutes {
  private userController: UserController;

  constructor({ userController }: { userController: UserController }) {
    super();
    this.userController = userController;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
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
    this.router.delete(
      "/users/:id",
      this.handle(this.userController, this.userController.deleteUser),
    );
  }
}
