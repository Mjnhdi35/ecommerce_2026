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
import { Category } from "./category.model";

const COLLECTION_NAME = "categories";

export class CategoryRepository {
  private collection: Collection<Category>;

  constructor({ db }: { db: Db }) {
    this.collection = db.collection<Category>(COLLECTION_NAME);
  }

  public async findAll(filter: Filter<Category>): Promise<WithId<Category>[]> {
    return this.collection.find(filter).sort({ name: 1 }).toArray();
  }

  public async findById(id: ObjectId): Promise<WithId<Category> | null> {
    return this.collection.findOne({ _id: id });
  }

  public async findBySlug(slug: string): Promise<WithId<Category> | null> {
    return this.collection.findOne({ slug });
  }

  public async insert(document: OptionalId<Category>): Promise<ObjectId> {
    const result = await this.collection.insertOne(document);
    return result.insertedId;
  }

  public async update(
    id: ObjectId,
    update: Partial<Category>,
  ): Promise<UpdateResult> {
    return this.collection.updateOne({ _id: id }, { $set: update });
  }

  public async delete(id: ObjectId): Promise<DeleteResult> {
    return this.collection.deleteOne({ _id: id });
  }
}
