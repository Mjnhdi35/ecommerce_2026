import { ObjectId } from 'mongodb';

export const USER_ROLES = ["user", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export interface User {
  _id?: ObjectId;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserDocument extends User {
  _id: ObjectId;
}
