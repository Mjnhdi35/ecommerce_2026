import { AuthMiddleware } from "../auth/auth.middleware";
import { BaseRoutes } from "../../shared/routes/base.routes";
import { CartController } from "./cart.controller";

export class CartRoutes extends BaseRoutes {
  private authMiddleware: AuthMiddleware;
  private cartController: CartController;

  constructor({
    authMiddleware,
    cartController,
  }: {
    authMiddleware: AuthMiddleware;
    cartController: CartController;
  }) {
    super();
    this.authMiddleware = authMiddleware;
    this.cartController = cartController;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    const auth = this.authMiddleware.authenticate;

    this.route("get", "/cart", "authenticated", auth, this.cartController.getCart);
    this.route("post", "/cart/items", "authenticated", auth, this.cartController.addItem);
    this.route("patch", "/cart/items/:productId", "authenticated", auth, this.cartController.updateItem);
    this.route("delete", "/cart/items/:productId", "authenticated", auth, this.cartController.removeItem);
    this.route("delete", "/cart", "authenticated", auth, this.cartController.clearCart);
  }
}
