import { AuthMiddleware } from "../auth/auth.middleware";
import { BaseRoutes } from "../../shared/routes/base.routes";
import { OrderController } from "./order.controller";

export class OrderRoutes extends BaseRoutes {
  private authMiddleware: AuthMiddleware;
  private orderController: OrderController;

  constructor({
    authMiddleware,
    orderController,
  }: {
    authMiddleware: AuthMiddleware;
    orderController: OrderController;
  }) {
    super();
    this.authMiddleware = authMiddleware;
    this.orderController = orderController;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    const auth = this.authMiddleware.authenticate;

    this.route("get", "/orders", "authenticated", auth, this.orderController.getOrders);
    this.route("post", "/orders", "authenticated", auth, this.orderController.createOrder);
    this.route("get", "/orders/:id", "authenticated", auth, this.orderController.getOrderById);
    this.route("patch", "/orders/:id/cancel", "authenticated", auth, this.orderController.cancelOrder);
  }
}
