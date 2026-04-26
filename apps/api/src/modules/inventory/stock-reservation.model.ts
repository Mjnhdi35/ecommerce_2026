import { ObjectId } from "mongodb";

export const STOCK_RESERVATION_STATUSES = [
  "reserved",
  "released",
  "confirmed",
] as const;
export type StockReservationStatus = (typeof STOCK_RESERVATION_STATUSES)[number];

export interface StockReservation {
  _id?: ObjectId;
  createdAt: Date;
  expiresAt: Date;
  orderId: ObjectId;
  productId: ObjectId;
  quantity: number;
  releasedAt?: Date;
  status: StockReservationStatus;
  updatedAt: Date;
  userId: ObjectId;
}
