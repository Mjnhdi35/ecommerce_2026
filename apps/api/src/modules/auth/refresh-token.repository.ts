import {
  Collection,
  Db,
  Filter,
  ObjectId,
  OptionalId,
  UpdateResult,
  WithId,
} from "mongodb";
import { RefreshToken } from "./refresh-token.model";

const COLLECTION_NAME = "refresh_tokens";

export class RefreshTokenRepository {
  private collection: Collection<RefreshToken>;

  constructor({ db }: { db: Db }) {
    this.collection = db.collection<RefreshToken>(COLLECTION_NAME);
  }

  public async insert(document: OptionalId<RefreshToken>): Promise<void> {
    await this.collection.insertOne(document);
  }

  public async findActiveByUserId(
    userId: ObjectId,
  ): Promise<WithId<RefreshToken>[]> {
    return this.collection
      .find(this.getActiveFilter({ userId }))
      .sort({ createdAt: -1 })
      .toArray();
  }

  public async rotateValidToken({
    tokenHash,
    userId,
  }: {
    tokenHash: string;
    userId: ObjectId;
  }): Promise<WithId<RefreshToken> | null> {
    return this.collection.findOneAndUpdate(
      {
        tokenHash,
        userId,
        revokedAt: { $exists: false },
        expiresAt: { $gt: new Date() },
      },
      {
        $set: {
          revokedAt: new Date(),
        },
      },
      { returnDocument: "before" },
    );
  }

  public async revokeByHash(tokenHash: string): Promise<void> {
    await this.collection.updateOne(
      {
        tokenHash,
        revokedAt: { $exists: false },
      },
      {
        $set: {
          revokedAt: new Date(),
        },
      },
    );
  }

  public async revokeByIdForUser({
    id,
    userId,
  }: {
    id: ObjectId;
    userId: ObjectId;
  }): Promise<UpdateResult> {
    return this.collection.updateOne(
      this.getActiveFilter({ _id: id, userId }),
      {
        $set: {
          revokedAt: new Date(),
        },
      },
    );
  }

  public async revokeByUserId(userId: ObjectId): Promise<void> {
    await this.collection.updateMany(
      {
        userId,
        revokedAt: { $exists: false },
      },
      {
        $set: {
          revokedAt: new Date(),
        },
      },
    );
  }

  private getActiveFilter(
    filter: Filter<RefreshToken>,
  ): Filter<RefreshToken> {
    return {
      ...filter,
      revokedAt: { $exists: false },
      expiresAt: { $gt: new Date() },
    };
  }
}
