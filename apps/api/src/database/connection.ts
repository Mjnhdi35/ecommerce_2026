import {
  Db,
  MongoClient,
  MongoClientOptions,
  MongoServerError,
  ServerApiVersion,
} from "mongodb";
import { Logger } from "../shared/logger/logger.service";

const logger = new Logger("Database");

interface MongoConfig {
  url: string;
  dbName: string | undefined;
  options?: MongoClientOptions;
}

class MongoConnection {
  private static instance: MongoConnection;
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private isConnected = false;
  private config: MongoConfig;

  private constructor() {
    const mongoUrl = process.env.MONGO_URL;
    if (!mongoUrl) {
      throw new Error("MONGO_URL is required");
    }

    this.config = {
      url: mongoUrl,
      dbName: process.env.DB_NAME || undefined,
      options: {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        },
        maxPoolSize: 10,
        minPoolSize: 2,
        maxIdleTimeMS: 30000,
        waitQueueTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 30000,
        retryWrites: true,
        retryReads: true,
      },
    };
  }

  static getInstance(): MongoConnection {
    if (!MongoConnection.instance) {
      MongoConnection.instance = new MongoConnection();
    }
    return MongoConnection.instance;
  }

  async connect(): Promise<Db> {
    if (this.isConnected && this.db) {
      return this.db;
    }

    try {
      logger.info(
        `Connecting to MongoDB${this.config.dbName ? `: ${this.config.dbName}` : ""}`,
      );
      this.client = new MongoClient(this.config.url, this.config.options);

      await this.connectWithRetry();

      this.db = this.client.db(this.config.dbName);
      await this.ensureInitialCollections(this.db);
      this.isConnected = true;

      await this.db.admin().ping();
      logger.info(
        `Successfully connected to MongoDB${this.config.dbName ? ` database: ${this.config.dbName}` : ""}`,
      );

      return this.db;
    } catch (error) {
      logger.error("Failed to connect to MongoDB", error);

      await this.disconnect();
      throw error;
    }
  }

  private async ensureInitialCollections(db: Db): Promise<void> {
    const collections = await db.listCollections().toArray();
    const collectionNames = new Set(collections.map((collection) => collection.name));

    if (!collectionNames.has("users")) {
      await db.createCollection("users");
      logger.info('Created initial "users" collection');
    }

    if (!collectionNames.has("refresh_tokens")) {
      await db.createCollection("refresh_tokens");
      logger.info('Created initial "refresh_tokens" collection');
    }

    try {
      await db.collection("users").createIndex({ email: 1 }, { unique: true });
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        logger.warn(
          'Skipped unique "users.email" index because duplicate emails already exist',
        );
      } else {
        throw error;
      }
    }
    await db
      .collection("refresh_tokens")
      .createIndex({ tokenHash: 1 }, { unique: true });
    await db.collection("refresh_tokens").createIndex({ userId: 1 });
    await db
      .collection("refresh_tokens")
      .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  }

  private async connectWithRetry(
    maxRetries = 3,
    delayMs = 1000,
  ): Promise<void> {
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        if (!this.client) {
          throw new Error("MongoClient not initialized");
        }

        await this.client.connect();
        return;
      } catch (error) {
        attempt++;
        logger.warn(`Connection attempt ${attempt} failed`, error);

        if (attempt === maxRetries) {
          throw error;
        }

        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
      }
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.client) {
        await this.client.close();
        this.client = null;
        this.db = null;
        this.isConnected = false;
        logger.info("Disconnected from MongoDB");
      }
    } catch (error) {
      logger.error("Error disconnecting from MongoDB", error);
      throw error;
    }
  }

  getDb(): Db {
    if (!this.db || !this.isConnected) {
      throw new Error("Database not connected. Call connect() first.");
    }
    return this.db;
  }

  isHealthy(): boolean {
    return this.isConnected && !!this.client;
  }

  async ping(): Promise<boolean> {
    try {
      if (!this.isConnected || !this.db) {
        return false;
      }

      await this.db.admin().ping();
      return true;
    } catch (error) {
      logger.error("MongoDB health check failed", error);
      return false;
    }
  }
}

export const mongoConnection = MongoConnection.getInstance();
export const connectToDatabase = () => mongoConnection.connect();
export const disconnectFromDatabase = () => mongoConnection.disconnect();
export const getDatabase = () => mongoConnection.getDb();
export const isDatabaseConnected = () => mongoConnection.isHealthy();
export const pingDatabase = () => mongoConnection.ping();
