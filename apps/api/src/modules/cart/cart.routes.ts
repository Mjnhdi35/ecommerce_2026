import { AuthMiddleware } from "../auth/auth.middleware";
import { BaseRoutes, RouteDefinition } from "../../shared/routes/base.routes";
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
    this.router.use("/cart", this.authMiddleware.authenticate);
    this.router.get(
      "/cart",
      this.handle(this.cartController, this.cartController.getCart),
    );
    this.router.post(
      "/cart/items",
      this.handle(this.cartController, this.cartController.addItem),
    );
    this.router.patch(
      "/cart/items/:productId",
      this.handle(this.cartController, this.cartController.updateItem),
    );
    this.router.delete(
      "/cart/items/:productId",
      this.handle(this.cartController, this.cartController.removeItem),
    );
    this.router.delete(
      "/cart",
      this.handle(this.cartController, this.cartController.clearCart),
    );
  }

  public getRoutes(): RouteDefinition[] {
    return [
      { method: "GET", path: "/cart", access: "authenticated" },
      { method: "POST", path: "/cart/items", access: "authenticated" },
      { method: "PATCH", path: "/cart/items/:productId", access: "authenticated" },
      { method: "DELETE", path: "/cart/items/:productId", access: "authenticated" },
      { method: "DELETE", path: "/cart", access: "authenticated" },
    ];
  }
}
