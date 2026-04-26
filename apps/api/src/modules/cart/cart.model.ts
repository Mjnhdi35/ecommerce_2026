import { ObjectId } from "mongodb";

export interface CartItem {
  createdAt: Date;
  productId: ObjectId;
  quantity: number;
  updatedAt: Date;
}

export interface Cart {
  _id?: ObjectId;
  createdAt: Date;
  items: CartItem[];
  updatedAt: Date;
  userId: ObjectId;
}
