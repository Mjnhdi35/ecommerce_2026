import { AuthMiddleware } from "../auth/auth.middleware";
import { BaseRoutes, RouteDefinition } from "../../shared/routes/base.routes";
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
    this.router.use("/orders", this.authMiddleware.authenticate);
    this.router.get(
      "/orders",
      this.handle(this.orderController, this.orderController.getOrders),
    );
    this.router.post(
      "/orders",
      this.handle(this.orderController, this.orderController.createOrder),
    );
    this.router.get(
      "/orders/:id",
      this.handle(this.orderController, this.orderController.getOrderById),
    );
    this.router.patch(
      "/orders/:id/cancel",
      this.handle(this.orderController, this.orderController.cancelOrder),
    );
  }

  public getRoutes(): RouteDefinition[] {
    return [
      { method: "GET", path: "/orders", access: "authenticated" },
      { method: "POST", path: "/orders", access: "authenticated" },
      { method: "GET", path: "/orders/:id", access: "authenticated" },
      { method: "PATCH", path: "/orders/:id/cancel", access: "authenticated" },
    ];
  }
}
