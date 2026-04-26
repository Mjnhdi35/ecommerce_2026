import {
  Collection,
  Db,
  DeleteResult,
  ObjectId,
  OptionalId,
  UpdateResult,
  WithId,
} from "mongodb";
import { User, UserRole } from "./user.model";

const COLLECTION_NAME = "users";

export class UserRepository {
  private collection: Collection<User>;

  constructor({ db }: { db: Db }) {
    this.collection = db.collection<User>(COLLECTION_NAME);
  }

  public async findAll(): Promise<WithId<User>[]> {
    return this.collection.find().sort({ createdAt: -1 }).toArray();
  }

  public async count(): Promise<number> {
    return this.collection.countDocuments();
  }

  public async countByRole(role: UserRole): Promise<number> {
    return this.collection.countDocuments({ role });
  }

  public async findById(id: ObjectId): Promise<WithId<User> | null> {
    return this.collection.findOne({ _id: id });
  }

  public async findByEmail(email: string): Promise<WithId<User> | null> {
    return this.collection.findOne({ email });
  }

  public async insert(document: OptionalId<User>): Promise<ObjectId> {
    const result = await this.collection.insertOne(document);
    return result.insertedId;
  }

  public async update(
    id: ObjectId,
    update: Partial<User>,
  ): Promise<UpdateResult> {
    return this.collection.updateOne({ _id: id }, { $set: update });
  }

  public async delete(id: ObjectId): Promise<DeleteResult> {
    return this.collection.deleteOne({ _id: id });
  }
}
