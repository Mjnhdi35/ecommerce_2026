import { Db, Collection, InsertOneResult, UpdateResult, DeleteResult, Filter, WithId, Document, OptionalUnlessRequiredId } from 'mongodb';
import { getDatabase, pingDatabase } from '../database/connection';
import { environment } from '../config/environment';
import { Logger } from './logger.service';

const logger = new Logger('MongoDB');

export interface MongoError extends Error {
  code?: number;
  statusCode?: number;
}

export class MongoService {
  private db: Db;

  constructor() {
    this.db = getDatabase();
  }

  public async getMongoStatus() {
    try {
      const isHealthy = await pingDatabase();

      if (!isHealthy) {
        throw new Error('MongoDB health check failed');
      }

      const stats = await this.db.stats();
      const collections = await this.db.listCollections().toArray();

      logger.info(`Connected to database: ${environment.DB_NAME}`);

      return {
        status: "OK",
        message: "MongoDB connected successfully",
        database: environment.DB_NAME,
        env: environment.NODE_ENV,
        stats: {
          collections: collections.length,
          dataSize: stats.dataSize,
          storageSize: stats.storageSize,
          indexSize: stats.indexSize,
          objects: stats.objects,
        }
      };
    } catch (error) {
      logger.error("MongoDB connection failed", error);
      throw {
        status: "ERROR",
        message: "MongoDB connection failed",
        error: error instanceof Error ? error.message : "Unknown error",
        code: (error as MongoError).code || 500,
      };
    }
  }

  async insertOne<T extends Document>(collectionName: string, document: OptionalUnlessRequiredId<T>): Promise<InsertOneResult> {
    try {
      const collection: Collection<T> = this.db.collection<T>(collectionName);
      const result = await collection.insertOne(document);

      logger.debug(`Inserted document into ${collectionName}`, { insertedId: result.insertedId });
      return result;
    } catch (error) {
      logger.error(`Failed to insert document into ${collectionName}`, error);
      this.throwMongoError(error, `Insert failed for ${collectionName}`);
    }
  }

  async findMany<T extends Document>(collectionName: string, filter: Filter<T> = {}): Promise<WithId<T>[]> {
    try {
      const collection: Collection<T> = this.db.collection<T>(collectionName);
      const results = await collection.find(filter).toArray();

      logger.debug(`Found ${results.length} documents in ${collectionName}`);
      return results;
    } catch (error) {
      logger.error(`Failed to find documents in ${collectionName}`, error);
      this.throwMongoError(error, `Find failed for ${collectionName}`);
    }
  }

  async findOne<T extends Document>(collectionName: string, filter: Filter<T>): Promise<WithId<T> | null> {
    try {
      const collection: Collection<T> = this.db.collection<T>(collectionName);
      const result = await collection.findOne(filter);

      logger.debug(`Found document in ${collectionName}`, { found: !!result });
      return result;
    } catch (error) {
      logger.error(`Failed to find document in ${collectionName}`, error);
      this.throwMongoError(error, `FindOne failed for ${collectionName}`);
    }
  }

  async updateOne<T extends Document>(collectionName: string, filter: Filter<T>, update: Partial<T>): Promise<UpdateResult> {
    try {
      const collection: Collection<T> = this.db.collection<T>(collectionName);
      const result = await collection.updateOne(filter, { $set: update });

      logger.debug(`Updated document in ${collectionName}`, { modifiedCount: result.modifiedCount });
      return result;
    } catch (error) {
      logger.error(`Failed to update document in ${collectionName}`, error);
      this.throwMongoError(error, `Update failed for ${collectionName}`);
    }
  }

  async deleteOne<T extends Document>(collectionName: string, filter: Filter<T>): Promise<DeleteResult> {
    try {
      const collection: Collection<T> = this.db.collection<T>(collectionName);
      const result = await collection.deleteOne(filter);

      logger.debug(`Deleted document from ${collectionName}`, { deletedCount: result.deletedCount });
      return result;
    } catch (error) {
      logger.error(`Failed to delete document from ${collectionName}`, error);
      this.throwMongoError(error, `Delete failed for ${collectionName}`);
    }
  }

  async countDocuments<T extends Document>(collectionName: string, filter: Filter<T> = {}): Promise<number> {
    try {
      const collection: Collection<T> = this.db.collection<T>(collectionName);
      const count = await collection.countDocuments(filter);

      logger.debug(`Counted ${count} documents in ${collectionName}`);
      return count;
    } catch (error) {
      logger.error(`Failed to count documents in ${collectionName}`, error);
      this.throwMongoError(error, `Count failed for ${collectionName}`);
    }
  }

  async withTransaction<T>(callback: (session: any) => Promise<T>): Promise<T> {
    const session = this.db.client.startSession();

    try {
      logger.debug('Starting MongoDB transaction');

      const result = await session.withTransaction(callback);
      logger.debug('MongoDB transaction completed successfully');

      return result;
    } catch (error) {
      logger.error('MongoDB transaction failed', error);
      this.throwMongoError(error, 'Transaction failed');
    } finally {
      await session.endSession();
    }
  }

  private throwMongoError(error: any, operation: string): never {
    const mongoError = error as MongoError;

    if (mongoError.code === 11000) {
      throw new Error(`Duplicate key error in ${operation}`);
    }

    if (mongoError.code === 2) {
      throw new Error(`BadValue in ${operation}`);
    }

    throw error;
  }
}