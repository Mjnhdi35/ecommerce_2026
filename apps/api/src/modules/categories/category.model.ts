import { ObjectId } from "mongodb";

export const CATEGORY_STATUSES = ["active", "archived"] as const;
export type CategoryStatus = (typeof CATEGORY_STATUSES)[number];

export interface Category {
  _id?: ObjectId;
  createdAt?: Date;
  description?: string;
  name: string;
  parentId?: ObjectId;
  slug: string;
  status: CategoryStatus;
  updatedAt?: Date;
}
