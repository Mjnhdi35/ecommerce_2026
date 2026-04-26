import {
  Collection,
  Db,
  DeleteResult,
  Filter,
  ObjectId,
  OptionalId,
  UpdateResult,
  WithId,
} from "mongodb";
import { Product } from "./product.model";

const COLLECTION_NAME = "products";

export class ProductRepository {
  private collection: Collection<Product>;

  constructor({ db }: { db: Db }) {
    this.collection = db.collection<Product>(COLLECTION_NAME);
  }

  public async findAll({
    filter,
    limit,
    page,
  }: {
    filter: Filter<Product>;
    limit: number;
    page: number;
  }): Promise<{ items: WithId<Product>[]; total: number }> {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.collection
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      this.collection.countDocuments(filter),
    ]);

    return { items, total };
  }

  public async findById(id: ObjectId): Promise<WithId<Product> | null> {
    return this.collection.findOne({ _id: id });
  }

  public async findBySlug(slug: string): Promise<WithId<Product> | null> {
    return this.collection.findOne({ slug });
  }

  public async insert(document: OptionalId<Product>): Promise<ObjectId> {
    const result = await this.collection.insertOne(document);
    return result.insertedId;
  }

  public async update(
    id: ObjectId,
    update: Partial<Product>,
  ): Promise<UpdateResult> {
    return this.collection.updateOne({ _id: id }, { $set: update });
  }

  public async delete(id: ObjectId): Promise<DeleteResult> {
    return this.collection.deleteOne({ _id: id });
  }
}
