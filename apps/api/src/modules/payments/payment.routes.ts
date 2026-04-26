import { AuthMiddleware } from "../auth/auth.middleware";
import { BaseRoutes, RouteDefinition } from "../../shared/routes/base.routes";
import { PaymentController } from "./payment.controller";

export class PaymentRoutes extends BaseRoutes {
  private authMiddleware: AuthMiddleware;
  private paymentController: PaymentController;

  constructor({
    authMiddleware,
    paymentController,
  }: {
    authMiddleware: AuthMiddleware;
    paymentController: PaymentController;
  }) {
    super();
    this.authMiddleware = authMiddleware;
    this.paymentController = paymentController;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.use("/payments", this.authMiddleware.authenticate);
    this.router.get(
      "/payments",
      this.handle(this.paymentController, this.paymentController.getPayments),
    );
    this.router.post(
      "/payments/intents",
      this.handle(this.paymentController, this.paymentController.createIntent),
    );
    this.router.get(
      "/payments/:id",
      this.handle(this.paymentController, this.paymentController.getPaymentById),
    );
    this.router.post(
      "/payments/:id/confirm",
      this.handle(this.paymentController, this.paymentController.confirmPayment),
    );
  }

  public getRoutes(): RouteDefinition[] {
    return [
      { method: "GET", path: "/payments", access: "authenticated" },
      { method: "POST", path: "/payments/intents", access: "authenticated" },
      { method: "GET", path: "/payments/:id", access: "authenticated" },
      { method: "POST", path: "/payments/:id/confirm", access: "authenticated" },
    ];
  }
}
