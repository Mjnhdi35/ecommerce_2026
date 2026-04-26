import { MongoServerError, ObjectId, OptionalId, WithId } from "mongodb";
import { environment } from "../../config/environment";
import { HttpError } from "../../shared/errors/http-error";
import { AuditService } from "../audit";
import { OrderService } from "../orders/order.service";
import { ManualPaymentProvider } from "./manual-payment.provider";
import { Payment } from "./payment.model";
import { PaymentRepository } from "./payment.repository";

export interface CreatePaymentIntentInput {
  idempotencyKey: string;
  orderId: string;
  userId: string;
}

export class PaymentService {
  private auditService: AuditService;
  private manualPaymentProvider: ManualPaymentProvider;
  private orderService: OrderService;
  private paymentRepository: PaymentRepository;

  constructor({
    auditService,
    manualPaymentProvider,
    orderService,
    paymentRepository,
  }: {
    auditService: AuditService;
    manualPaymentProvider: ManualPaymentProvider;
    orderService: OrderService;
    paymentRepository: PaymentRepository;
  }) {
    this.auditService = auditService;
    this.manualPaymentProvider = manualPaymentProvider;
    this.orderService = orderService;
    this.paymentRepository = paymentRepository;
  }

  public async createIntent(
    input: CreatePaymentIntentInput,
  ): Promise<WithId<Payment>> {
    const userId = this.toObjectId(input.userId, "Invalid user id");
    const existingPayment = await this.paymentRepository.findByIdempotencyKey({
      idempotencyKey: input.idempotencyKey,
      userId,
    });

    if (existingPayment) {
      return existingPayment;
    }

    const order = await this.orderService.findByIdForUser(
      input.orderId,
      input.userId,
    );

    if (order.status !== "pending_payment") {
      throw new HttpError(400, "Order is not pending payment");
    }

    const providerIntent = this.manualPaymentProvider.createIntent();
    const now = new Date();
    const document: OptionalId<Payment> = {
      amount: order.total,
      clientSecret: providerIntent.clientSecret,
      createdAt: now,
      currency: environment.DEFAULT_CURRENCY,
      idempotencyKey: input.idempotencyKey,
      orderId: order._id,
      provider: "manual",
      providerPaymentId: providerIntent.providerPaymentId,
      status: "requires_confirmation",
      updatedAt: now,
      userId,
    };

    try {
      const insertedId = await this.paymentRepository.insert(document);
      await this.auditService.record({
        action: "PAYMENT_INTENT_CREATED",
        entityId: insertedId,
        entityType: "payment",
        metadata: {
          amount: order.total,
          orderId: order._id.toHexString(),
          provider: "manual",
        },
        userId,
      });

      return this.findByIdForUser(insertedId.toHexString(), input.userId);
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        const payment = await this.paymentRepository.findByIdempotencyKey({
          idempotencyKey: input.idempotencyKey,
          userId,
        });

        if (payment) {
          return payment;
        }
      }

      throw error;
    }
  }

  public async findByUserId(userId: string): Promise<WithId<Payment>[]> {
    return this.paymentRepository.findByUserId(
      this.toObjectId(userId, "Invalid user id"),
    );
  }

  public async findByIdForUser(
    paymentId: string,
    userId: string,
  ): Promise<WithId<Payment>> {
    const payment = await this.paymentRepository.findById(
      this.toObjectId(paymentId, "Invalid payment id"),
    );

    if (!payment || !payment.userId.equals(this.toObjectId(userId, "Invalid user id"))) {
      throw new HttpError(404, "Payment not found");
    }

    return payment;
  }

  public async confirm(paymentId: string, userId: string): Promise<WithId<Payment>> {
    const payment = await this.findByIdForUser(paymentId, userId);

    if (payment.status !== "requires_confirmation") {
      throw new HttpError(400, "Payment cannot be confirmed");
    }

    this.manualPaymentProvider.confirm();

    const result = await this.paymentRepository.updateStatus({
      id: payment._id,
      status: "requires_confirmation",
      update: {
        confirmedAt: new Date(),
        status: "succeeded",
      },
    });

    if (result.matchedCount === 0) {
      throw new HttpError(409, "Payment state changed");
    }

    await this.orderService.markPaid(payment.orderId, userId);
    await this.auditService.record({
      action: "PAYMENT_CONFIRMED",
      entityId: payment._id,
      entityType: "payment",
      metadata: {
        orderId: payment.orderId.toHexString(),
        provider: payment.provider,
      },
      userId: payment.userId,
    });

    return this.findByIdForUser(paymentId, userId);
  }

  private toObjectId(id: string, message: string): ObjectId {
    if (!ObjectId.isValid(id)) {
      throw new HttpError(400, message);
    }

    return new ObjectId(id);
  }
}
