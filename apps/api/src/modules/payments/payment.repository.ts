import { Collection, Db, ObjectId, OptionalId, UpdateResult, WithId } from "mongodb";
import { Payment, PaymentStatus } from "./payment.model";

const COLLECTION_NAME = "payments";

export class PaymentRepository {
  private collection: Collection<Payment>;

  constructor({ db }: { db: Db }) {
    this.collection = db.collection<Payment>(COLLECTION_NAME);
  }

  public async insert(document: OptionalId<Payment>): Promise<ObjectId> {
    const result = await this.collection.insertOne(document);
    return result.insertedId;
  }

  public async findById(id: ObjectId): Promise<WithId<Payment> | null> {
    return this.collection.findOne({ _id: id });
  }

  public async findByUserId(userId: ObjectId): Promise<WithId<Payment>[]> {
    return this.collection.find({ userId }).sort({ createdAt: -1 }).toArray();
  }

  public async findByIdempotencyKey({
    idempotencyKey,
    userId,
  }: {
    idempotencyKey: string;
    userId: ObjectId;
  }): Promise<WithId<Payment> | null> {
    return this.collection.findOne({ idempotencyKey, userId });
  }

  public async updateStatus({
    id,
    status,
    update,
  }: {
    id: ObjectId;
    status: PaymentStatus;
    update: Partial<Payment>;
  }): Promise<UpdateResult> {
    return this.collection.updateOne(
      { _id: id, status },
      {
        $set: {
          ...update,
          updatedAt: new Date(),
        },
      },
    );
  }
}
