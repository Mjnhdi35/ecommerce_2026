import { getDatabase } from '../database/connection';

export class MongoService {
  public getMongoStatus = async () => {
    const db = getDatabase();
    await db.admin().ping();

    return {
      status: "OK",
      message: "MongoDB connected successfully",
      database: "ecommerce",
      env: process.env.NODE_ENV || "No Environment",
    };
  };
}