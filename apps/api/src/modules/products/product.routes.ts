import { BaseRoutes, RouteDefinition } from "../../shared/routes/base.routes";
import { AuthMiddleware } from "../auth/auth.middleware";
import { ProductController } from "./product.controller";

export class ProductRoutes extends BaseRoutes {
  private authMiddleware: AuthMiddleware;
  private productController: ProductController;

  constructor({
    authMiddleware,
    productController,
  }: {
    authMiddleware: AuthMiddleware;
    productController: ProductController;
  }) {
    super();
    this.authMiddleware = authMiddleware;
    this.productController = productController;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/products",
      this.handle(this.productController, this.productController.getProducts),
    );
    this.router.get(
      "/products/slug/:slug",
      this.handle(this.productController, this.productController.getProductBySlug),
    );
    this.router.get(
      "/products/:id",
      this.handle(this.productController, this.productController.getProductById),
    );

    this.router.use(
      "/products",
      this.authMiddleware.authenticate,
      this.authMiddleware.requireRoles("admin"),
    );
    this.router.post(
      "/products",
      this.handle(this.productController, this.productController.createProduct),
    );
    this.router.put(
      "/products/:id",
      this.handle(this.productController, this.productController.updateProduct),
    );
    this.router.delete(
      "/products/:id",
      this.handle(this.productController, this.productController.deleteProduct),
    );
  }

  public getRoutes(): RouteDefinition[] {
    return [
      { method: "GET", path: "/products", access: "public" },
      { method: "GET", path: "/products/slug/:slug", access: "public" },
      { method: "GET", path: "/products/:id", access: "public" },
      { method: "POST", path: "/products", access: "admin" },
      { method: "PUT", path: "/products/:id", access: "admin" },
      { method: "DELETE", path: "/products/:id", access: "admin" },
    ];
  }
}
