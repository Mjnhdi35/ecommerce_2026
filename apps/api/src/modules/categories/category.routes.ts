import { AuthMiddleware } from "../auth/auth.middleware";
import { BaseRoutes } from "../../shared/routes/base.routes";
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
    const admin = this.authMiddleware.requireRoles("admin");
    const auth = this.authMiddleware.authenticate;

    this.route("get", "/categories", "public", this.categoryController.getCategories);
    this.route("get", "/categories/slug/:slug", "public", this.categoryController.getCategoryBySlug);
    this.route("get", "/categories/:id", "public", this.categoryController.getCategoryById);
    this.route("post", "/categories", "admin", auth, admin, this.categoryController.createCategory);
    this.route("put", "/categories/:id", "admin", auth, admin, this.categoryController.updateCategory);
    this.route("delete", "/categories/:id", "admin", auth, admin, this.categoryController.archiveCategory);
  }
}
