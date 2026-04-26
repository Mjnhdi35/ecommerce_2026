import { Router, Request, Response, NextFunction } from "express";
import { container } from "../container";
import { UserController } from "../controllers/user.controller";

export class UserRoutes {
  private router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get("/users", this.getUsers);
    this.router.get("/users/:id", this.getUserById);
    this.router.post("/users", this.createUser);
    this.router.put("/users/:id", this.updateUser);
    this.router.delete("/users/:id", this.deleteUser);
  }

  private getUsers = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    await this.handle(req, res, next, (controller) => controller.getUsers(req, res));
  };

  private getUserById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    await this.handle(req, res, next, (controller) =>
      controller.getUserById(req, res),
    );
  };

  private createUser = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    await this.handle(req, res, next, (controller) =>
      controller.createUser(req, res),
    );
  };

  private updateUser = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    await this.handle(req, res, next, (controller) =>
      controller.updateUser(req, res),
    );
  };

  private deleteUser = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    await this.handle(req, res, next, (controller) =>
      controller.deleteUser(req, res),
    );
  };

  private async handle(
    _req: Request,
    res: Response,
    next: NextFunction,
    action: (controller: UserController) => Promise<void>,
  ): Promise<void> {
    const userController = container.resolve<UserController>("userController");

    try {
      await action(userController);
    } catch (error) {
      try {
        userController.handleError(error, res);
      } catch (unhandledError) {
        next(unhandledError);
      }
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
