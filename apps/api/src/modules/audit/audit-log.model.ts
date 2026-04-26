import { ObjectId } from "mongodb";

export interface AuditLog {
  _id?: ObjectId;
  action: string;
  createdAt: Date;
  entityId?: ObjectId;
  entityType: string;
  metadata?: Record<string, unknown>;
  userId?: ObjectId;
}
