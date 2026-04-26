import { BaseRoutes } from "../../shared/routes/base.routes";
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
    const admin = this.authMiddleware.requireRoles("admin");
    const auth = this.authMiddleware.authenticate;

    this.route("get", "/products", "public", this.productController.getProducts);
    this.route("get", "/products/slug/:slug", "public", this.productController.getProductBySlug);
    this.route("get", "/products/:id", "public", this.productController.getProductById);
    this.route("post", "/products", "admin", auth, admin, this.productController.createProduct);
    this.route("put", "/products/:id", "admin", auth, admin, this.productController.updateProduct);
    this.route("delete", "/products/:id", "admin", auth, admin, this.productController.deleteProduct);
  }
}
