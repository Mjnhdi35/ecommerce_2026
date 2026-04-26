import { AuthMiddleware } from "../auth/auth.middleware";
import { BaseRoutes, RouteDefinition } from "../../shared/routes/base.routes";
import { CategoryController } from "./category.controller";

export class CategoryRoutes extends BaseRoutes {
  private authMiddleware: AuthMiddleware;
  private categoryController: CategoryController;

  constructor({
    authMiddleware,
    categoryController,
  }: {
    authMiddleware: AuthMiddleware;
    categoryController: CategoryController;
  }) {
    super();
    this.authMiddleware = authMiddleware;
    this.categoryController = categoryController;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/categories",
      this.handle(this.categoryController, this.categoryController.getCategories),
    );
    this.router.get(
      "/categories/slug/:slug",
      this.handle(this.categoryController, this.categoryController.getCategoryBySlug),
    );
    this.router.get(
      "/categories/:id",
      this.handle(this.categoryController, this.categoryController.getCategoryById),
    );

    this.router.use(
      "/categories",
      this.authMiddleware.authenticate,
      this.authMiddleware.requireRoles("admin"),
    );
    this.router.post(
      "/categories",
      this.handle(this.categoryController, this.categoryController.createCategory),
    );
    this.router.put(
      "/categories/:id",
      this.handle(this.categoryController, this.categoryController.updateCategory),
    );
    this.router.delete(
      "/categories/:id",
      this.handle(this.categoryController, this.categoryController.archiveCategory),
    );
  }

  public getRoutes(): RouteDefinition[] {
    return [
      { method: "GET", path: "/categories", access: "public" },
      { method: "GET", path: "/categories/slug/:slug", access: "public" },
      { method: "GET", path: "/categories/:id", access: "public" },
      { method: "POST", path: "/categories", access: "admin" },
      { method: "PUT", path: "/categories/:id", access: "admin" },
      { method: "DELETE", path: "/categories/:id", access: "admin" },
    ];
  }
}
