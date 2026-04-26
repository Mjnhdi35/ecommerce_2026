import { ObjectId } from "mongodb";

export const ORDER_STATUSES = [
  "pending_payment",
  "paid",
  "processing",
  "shipped",
  "completed",
  "cancelled",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface OrderItem {
  productId: ObjectId;
  productName: string;
  productSlug: string;
  quantity: number;
  subtotal: number;
  unitPrice: number;
}

export interface Order {
  _id?: ObjectId;
  cancelledAt?: Date;
  createdAt: Date;
  items: OrderItem[];
  paidAt?: Date;
  status: OrderStatus;
  subtotal: number;
  total: number;
  updatedAt: Date;
  userId: ObjectId;
}
