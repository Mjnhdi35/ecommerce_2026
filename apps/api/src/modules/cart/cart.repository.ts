import { Collection, Db, ObjectId, WithId } from "mongodb";
import { Cart } from "./cart.model";

const COLLECTION_NAME = "carts";

export class CartRepository {
  private collection: Collection<Cart>;

  constructor({ db }: { db: Db }) {
    this.collection = db.collection<Cart>(COLLECTION_NAME);
  }

  public async findByUserId(userId: ObjectId): Promise<WithId<Cart> | null> {
    return this.collection.findOne({ userId });
  }

  public async save(cart: Cart): Promise<WithId<Cart>> {
    const result = await this.collection.findOneAndUpdate(
      { userId: cart.userId },
      { $set: cart },
      {
        returnDocument: "after",
        upsert: true,
      },
    );

    if (!result) {
      throw new Error("Failed to save cart");
    }

    return result;
  }

  public async clear(userId: ObjectId): Promise<void> {
    await this.collection.updateOne(
      { userId },
      {
        $set: {
          items: [],
          updatedAt: new Date(),
        },
      },
    );
  }
}
