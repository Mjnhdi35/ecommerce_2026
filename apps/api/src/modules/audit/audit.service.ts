import { ObjectId } from "mongodb";
import { AuditRepository } from "./audit.repository";

export interface AuditInput {
  action: string;
  entityId?: ObjectId;
  entityType: string;
  metadata?: Record<string, unknown>;
  userId?: ObjectId;
}

export class AuditService {
  private auditRepository: AuditRepository;

  constructor({ auditRepository }: { auditRepository: AuditRepository }) {
    this.auditRepository = auditRepository;
  }

  public async record(input: AuditInput): Promise<void> {
    await this.auditRepository.insert({
      ...input,
      createdAt: new Date(),
    });
  }
}
