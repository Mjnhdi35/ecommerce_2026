import { ObjectId, OptionalId, WithId } from "mongodb";
import { getDatabase } from "../database/connection";
import { User } from "../models/user";

const COLLECTION_NAME = "users";

export type CreateUserInput = Pick<User, "username" | "email" | "password">;
export type UpdateUserInput = Partial<CreateUserInput>;
export type PublicUser = Omit<WithId<User>, "password">;

export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
  }
}

export class UserService {
  private collection = getDatabase().collection<User>(COLLECTION_NAME);

  public async findAll(): Promise<PublicUser[]> {
    const users = await this.collection.find().sort({ createdAt: -1 }).toArray();
    return users.map(this.toPublicUser);
  }

  public async findById(id: string): Promise<PublicUser> {
    const user = await this.collection.findOne({ _id: this.toObjectId(id) });

    if (!user) {
      throw new HttpError(404, "User not found");
    }

    return this.toPublicUser(user);
  }

  public async create(input: CreateUserInput): Promise<PublicUser> {
    const now = new Date();
    const document: OptionalId<User> = {
      ...input,
      createdAt: now,
      updatedAt: now,
    };

    const result = await this.collection.insertOne(document);
    return this.findById(result.insertedId.toHexString());
  }

  public async update(id: string, input: UpdateUserInput): Promise<PublicUser> {
    const update: UpdateUserInput & { updatedAt: Date } = {
      ...input,
      updatedAt: new Date(),
    };

    const result = await this.collection.updateOne(
      { _id: this.toObjectId(id) },
      { $set: update },
    );

    if (result.matchedCount === 0) {
      throw new HttpError(404, "User not found");
    }

    return this.findById(id);
  }

  public async delete(id: string): Promise<void> {
    const result = await this.collection.deleteOne({ _id: this.toObjectId(id) });

    if (result.deletedCount === 0) {
      throw new HttpError(404, "User not found");
    }
  }

  private toObjectId(id: string): ObjectId {
    if (!ObjectId.isValid(id)) {
      throw new HttpError(400, "Invalid user id");
    }

    return new ObjectId(id);
  }

  private toPublicUser(user: WithId<User>): PublicUser {
    const { password, ...publicUser } = user;
    return publicUser;
  }
}
