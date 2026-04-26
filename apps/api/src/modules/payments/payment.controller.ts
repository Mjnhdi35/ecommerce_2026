import { Request, Response } from "express";
import { HttpError } from "../../shared/errors/http-error";
import { Controller } from "../../shared/http/controller";
import { AuthenticatedRequest } from "../auth/auth.middleware";
import { createPaymentIntentDto } from "./payment.dto";
import { PaymentService } from "./payment.service";

export class PaymentController extends Controller {
  private paymentService: PaymentService;

  constructor({ paymentService }: { paymentService: PaymentService }) {
    super();
    this.paymentService = paymentService;
  }

  public createIntent = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    const payload = createPaymentIntentDto.parse(req.body);
    const payment = await this.paymentService.createIntent({
      idempotencyKey: this.getIdempotencyKey(req),
      orderId: payload.orderId,
      userId: this.userId(req),
    });

    this.created(res, payment);
  };

  public getPayments = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    const payments = await this.paymentService.findByUserId(this.userId(req));

    this.ok(res, payments);
  };

  public getPaymentById = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    const payment = await this.paymentService.findByIdForUser(
      this.requiredParam(req, "id", "Invalid payment id"),
      this.userId(req),
    );

    this.ok(res, payment);
  };

  public confirmPayment = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    const payment = await this.paymentService.confirm(
      this.requiredParam(req, "id", "Invalid payment id"),
      this.userId(req),
    );

    this.ok(res, payment);
  };

  private getIdempotencyKey(req: Request): string {
    const value = req.headers["idempotency-key"];

    if (typeof value !== "string" || value.trim().length === 0) {
      throw new HttpError(400, "Idempotency-Key header is required");
    }

    if (value.length > 128) {
      throw new HttpError(400, "Idempotency-Key header is too long");
    }

    return value.trim();
  }
}
