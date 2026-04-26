import bcrypt from "bcrypt";
import {
  Collection,
  Db,
  MongoServerError,
  ObjectId,
  OptionalId,
  WithId,
} from "mongodb";
import { HttpError } from "../../shared/errors/http-error";
import { User, UserRole } from "./user.model";

const COLLECTION_NAME = "users";
const SALT_ROUNDS = 10;

export type CreateUserInput = Pick<User, "username" | "email" | "password"> & {
  role?: UserRole;
};
export type UpdateUserInput = Partial<Pick<User, "email" | "password" | "role" | "username">>;
export type UpdateProfileInput = Partial<Pick<User, "email" | "username">>;
export type PublicUser = Omit<WithId<User>, "password">;

export class UserService {
  private collection: Collection<User>;

  constructor({ db }: { db: Db }) {
    this.collection = db.collection<User>(COLLECTION_NAME);
  }

  public async findAll(): Promise<PublicUser[]> {
    const users = await this.collection.find().sort({ createdAt: -1 }).toArray();
    return users.map(this.toPublicUser);
  }

  public async count(): Promise<number> {
    return this.collection.countDocuments();
  }

  public async findById(id: string): Promise<PublicUser> {
    const user = await this.collection.findOne({ _id: this.toObjectId(id) });

    if (!user) {
      throw new HttpError(404, "User not found");
    }

    return this.toPublicUser(user);
  }

  public async findByIdWithPassword(id: string): Promise<WithId<User>> {
    const user = await this.collection.findOne({ _id: this.toObjectId(id) });

    if (!user) {
      throw new HttpError(404, "User not found");
    }

    return user;
  }

  public async findByEmailWithPassword(email: string): Promise<WithId<User> | null> {
    return this.collection.findOne({ email });
  }

  public async create(input: CreateUserInput): Promise<PublicUser> {
    const now = new Date();
    const document: OptionalId<User> = {
      ...input,
      password: await bcrypt.hash(input.password, SALT_ROUNDS),
      role: input.role || "user",
      createdAt: now,
      updatedAt: now,
    };

    try {
      const result = await this.collection.insertOne(document);
      return this.findById(result.insertedId.toHexString());
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  public async updateProfile(
    id: string,
    input: UpdateProfileInput,
  ): Promise<PublicUser> {
    return this.update(id, input);
  }

  public async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.findByIdWithPassword(id);
    const passwordMatches = await bcrypt.compare(currentPassword, user.password);

    if (!passwordMatches) {
      throw new HttpError(401, "Current password is incorrect");
    }

    await this.update(id, {
      password: newPassword,
    });
  }

  public async update(id: string, input: UpdateUserInput): Promise<PublicUser> {
    const update: UpdateUserInput & { updatedAt: Date } = {
      ...input,
      updatedAt: new Date(),
    };

    if (input.password) {
      update.password = await bcrypt.hash(input.password, SALT_ROUNDS);
    }

    let result;

    try {
      result = await this.collection.updateOne(
        { _id: this.toObjectId(id) },
        { $set: update },
      );
    } catch (error) {
      this.handleWriteError(error);
    }

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

  private handleWriteError(error: unknown): never {
    if (error instanceof MongoServerError && error.code === 11000) {
      throw new HttpError(409, "Email already exists");
    }

    throw error;
  }
}
