import { Collection, Db, ObjectId, OptionalId, UpdateResult, WithId } from "mongodb";
import { Order } from "./order.model";

const COLLECTION_NAME = "orders";

export class OrderRepository {
  private collection: Collection<Order>;

  constructor({ db }: { db: Db }) {
    this.collection = db.collection<Order>(COLLECTION_NAME);
  }

  public async insert(document: OptionalId<Order>): Promise<ObjectId> {
    const result = await this.collection.insertOne(document);
    return result.insertedId;
  }

  public async findById(id: ObjectId): Promise<WithId<Order> | null> {
    return this.collection.findOne({ _id: id });
  }

  public async findByUserId(userId: ObjectId): Promise<WithId<Order>[]> {
    return this.collection.find({ userId }).sort({ createdAt: -1 }).toArray();
  }

  public async update(id: ObjectId, update: Partial<Order>): Promise<UpdateResult> {
    return this.collection.updateOne({ _id: id }, { $set: update });
  }

  public async markPaid(id: ObjectId): Promise<UpdateResult> {
    return this.collection.updateOne(
      { _id: id, status: "pending_payment" },
      {
        $set: {
          paidAt: new Date(),
          status: "paid",
          updatedAt: new Date(),
        },
      },
    );
  }
}
