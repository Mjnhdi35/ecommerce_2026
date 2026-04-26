import { Collection, Db, OptionalId } from "mongodb";
import { AuditLog } from "./audit-log.model";

const COLLECTION_NAME = "audit_logs";

export class AuditRepository {
  private collection: Collection<AuditLog>;

  constructor({ db }: { db: Db }) {
    this.collection = db.collection<AuditLog>(COLLECTION_NAME);
  }

  public async insert(document: OptionalId<AuditLog>): Promise<void> {
    await this.collection.insertOne(document);
  }
}
