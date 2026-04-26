import { AuthMiddleware } from "../auth/auth.middleware";
import { BaseRoutes } from "../../shared/routes/base.routes";
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
    const auth = this.authMiddleware.authenticate;

    this.route("get", "/payments", "authenticated", auth, this.paymentController.getPayments);
    this.route("post", "/payments/intents", "authenticated", auth, this.paymentController.createIntent);
    this.route("get", "/payments/:id", "authenticated", auth, this.paymentController.getPaymentById);
    this.route("post", "/payments/:id/confirm", "authenticated", auth, this.paymentController.confirmPayment);
  }
}
