import { ObjectId } from "mongodb";

export const PRODUCT_STATUSES = ["active", "draft", "archived"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export interface Product {
  _id?: ObjectId;
  name: string;
  slug: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  images: string[];
  status: ProductStatus;
  createdAt?: Date;
  updatedAt?: Date;
}
