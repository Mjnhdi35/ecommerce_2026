import { ObjectId } from "mongodb";

export const PAYMENT_PROVIDERS = ["manual"] as const;
export type PaymentProvider = (typeof PAYMENT_PROVIDERS)[number];

export const PAYMENT_STATUSES = [
  "requires_confirmation",
  "succeeded",
  "failed",
  "cancelled",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export interface Payment {
  _id?: ObjectId;
  amount: number;
  clientSecret: string;
  confirmedAt?: Date;
  createdAt: Date;
  currency: string;
  failedAt?: Date;
  idempotencyKey: string;
  orderId: ObjectId;
  provider: PaymentProvider;
  providerPaymentId: string;
  status: PaymentStatus;
  updatedAt: Date;
  userId: ObjectId;
}
