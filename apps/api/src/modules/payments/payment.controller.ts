import { Request, Response } from "express";
import { HttpError } from "../../shared/errors/http-error";
import { ApiResponse } from "../../shared/http/response";
import { AuthenticatedRequest } from "../auth/auth.middleware";
import { createPaymentIntentDto } from "./payment.dto";
import { PaymentService } from "./payment.service";

export class PaymentController {
  private paymentService: PaymentService;

  constructor({ paymentService }: { paymentService: PaymentService }) {
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
      userId: this.getUserId(req),
    });

    ApiResponse.success(res, payment, 201);
  };

  public getPayments = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    const payments = await this.paymentService.findByUserId(this.getUserId(req));

    ApiResponse.success(res, payments);
  };

  public getPaymentById = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    const payment = await this.paymentService.findByIdForUser(
      this.getPaymentId(req),
      this.getUserId(req),
    );

    ApiResponse.success(res, payment);
  };

  public confirmPayment = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    const payment = await this.paymentService.confirm(
      this.getPaymentId(req),
      this.getUserId(req),
    );

    ApiResponse.success(res, payment);
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

  private getPaymentId(req: Request): string {
    const { id } = req.params;

    if (typeof id !== "string") {
      throw new HttpError(400, "Invalid payment id");
    }

    return id;
  }

  private getUserId(req: AuthenticatedRequest): string {
    if (!req.user) {
      throw new HttpError(401, "Authentication is required");
    }

    return req.user.id;
  }
}
