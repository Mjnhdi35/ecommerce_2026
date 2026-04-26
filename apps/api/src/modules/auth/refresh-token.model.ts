import { ObjectId } from "mongodb";

export interface RefreshToken {
  _id?: ObjectId;
  userId: ObjectId;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
  ipAddress?: string;
  revokedAt?: Date;
  userAgent?: string;
}
