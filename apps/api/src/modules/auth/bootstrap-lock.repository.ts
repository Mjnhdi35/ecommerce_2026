import { Collection, Db, MongoServerError } from "mongodb";

const COLLECTION_NAME = "bootstrap_locks";
const FIRST_ADMIN_LOCK_ID = "first-admin";

interface BootstrapLock {
  _id: string;
  createdAt: Date;
}

export class BootstrapLockRepository {
  private collection: Collection<BootstrapLock>;

  constructor({ db }: { db: Db }) {
    this.collection = db.collection<BootstrapLock>(COLLECTION_NAME);
  }

  public async claimFirstAdminLock(): Promise<boolean> {
    try {
      await this.collection.insertOne({
        _id: FIRST_ADMIN_LOCK_ID,
        createdAt: new Date(),
      });
      return true;
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        return false;
      }

      throw error;
    }
  }
}
