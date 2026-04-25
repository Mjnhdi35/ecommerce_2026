import { getDatabase } from '../database/connection';

import { Logger } from './logger.service';

const logger = new Logger('MongoDB');

export class MongoService {
  public getMongoStatus = async () => {
    try {
      const db = getDatabase();
      await db.admin().ping();

      const dbName = process.env.DB_NAME || 'ecommerce';

      logger.info(`Connected to database: ${dbName}`);

      return {
        status: "OK",
        message: "MongoDB connected successfully",
        database: dbName,
        env: process.env.NODE_ENV || "No Environment",
      };
    } catch (error) {
      logger.error("MongoDB connection failed", error);
      throw error;
    }
  };
}