import { Db, Collection, InsertOneResult, UpdateResult, DeleteResult, Filter, WithId, Document, OptionalUnlessRequiredId } from 'mongodb';
import { environment } from '../../config/environment';
import { MongoConnection } from '../../database/connection';
import { Logger, LoggerFactory } from '../../shared/logger/logger.service';

export interface MongoError extends Error {
  code?: number;
  statusCode?: number;
}

export class MongoService {
  private db: Db;
  private logger: Logger;
  private mongoConnection: MongoConnection;

  constructor({
    db,
    loggerFactory,
    mongoConnection,
  }: {
    db: Db;
    loggerFactory: LoggerFactory;
    mongoConnection: MongoConnection;
  }) {
    this.db = db;
    this.logger = loggerFactory.create("MongoDB");
    this.mongoConnection = mongoConnection;
  }

  public async getMongoStatus() {
    try {
      const isHealthy = await this.mongoConnection.ping();

      if (!isHealthy) {
        throw new Error('MongoDB health check failed');
      }

      const stats = await this.db.stats();
      const collections = await this.db.listCollections().toArray();

      this.logger.info(`Connected to database: ${environment.DB_NAME}`);

      return {
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
      this.logger.error("MongoDB connection failed", error);
      throw error;
    }
  }

  async insertOne<T extends Document>(collectionName: string, document: OptionalUnlessRequiredId<T>): Promise<InsertOneResult> {
    try {
      const collection: Collection<T> = this.db.collection<T>(collectionName);
      const result = await collection.insertOne(document);

      this.logger.debug(`Inserted document into ${collectionName}`, { insertedId: result.insertedId });
      return result;
    } catch (error) {
      this.logger.error(`Failed to insert document into ${collectionName}`, error);
      this.throwMongoError(error, `Insert failed for ${collectionName}`);
    }
  }

  async findMany<T extends Document>(collectionName: string, filter: Filter<T> = {}): Promise<WithId<T>[]> {
    try {
      const collection: Collection<T> = this.db.collection<T>(collectionName);
      const results = await collection.find(filter).toArray();

      this.logger.debug(`Found ${results.length} documents in ${collectionName}`);
      return results;
    } catch (error) {
      this.logger.error(`Failed to find documents in ${collectionName}`, error);
      this.throwMongoError(error, `Find failed for ${collectionName}`);
    }
  }

  async findOne<T extends Document>(collectionName: string, filter: Filter<T>): Promise<WithId<T> | null> {
    try {
      const collection: Collection<T> = this.db.collection<T>(collectionName);
      const result = await collection.findOne(filter);

      this.logger.debug(`Found document in ${collectionName}`, { found: !!result });
      return result;
    } catch (error) {
      this.logger.error(`Failed to find document in ${collectionName}`, error);
      this.throwMongoError(error, `FindOne failed for ${collectionName}`);
    }
  }

  async updateOne<T extends Document>(collectionName: string, filter: Filter<T>, update: Partial<T>): Promise<UpdateResult> {
    try {
      const collection: Collection<T> = this.db.collection<T>(collectionName);
      const result = await collection.updateOne(filter, { $set: update });

      this.logger.debug(`Updated document in ${collectionName}`, { modifiedCount: result.modifiedCount });
      return result;
    } catch (error) {
      this.logger.error(`Failed to update document in ${collectionName}`, error);
      this.throwMongoError(error, `Update failed for ${collectionName}`);
    }
  }

  async deleteOne<T extends Document>(collectionName: string, filter: Filter<T>): Promise<DeleteResult> {
    try {
      const collection: Collection<T> = this.db.collection<T>(collectionName);
      const result = await collection.deleteOne(filter);

      this.logger.debug(`Deleted document from ${collectionName}`, { deletedCount: result.deletedCount });
      return result;
    } catch (error) {
      this.logger.error(`Failed to delete document from ${collectionName}`, error);
      this.throwMongoError(error, `Delete failed for ${collectionName}`);
    }
  }

  async countDocuments<T extends Document>(collectionName: string, filter: Filter<T> = {}): Promise<number> {
    try {
      const collection: Collection<T> = this.db.collection<T>(collectionName);
      const count = await collection.countDocuments(filter);

      this.logger.debug(`Counted ${count} documents in ${collectionName}`);
      return count;
    } catch (error) {
      this.logger.error(`Failed to count documents in ${collectionName}`, error);
      this.throwMongoError(error, `Count failed for ${collectionName}`);
    }
  }

  async withTransaction<T>(callback: (session: any) => Promise<T>): Promise<T> {
    const session = this.db.client.startSession();

    try {
      this.logger.debug('Starting MongoDB transaction');

      const result = await session.withTransaction(callback);
      this.logger.debug('MongoDB transaction completed successfully');

      return result;
    } catch (error) {
      this.logger.error('MongoDB transaction failed', error);
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
