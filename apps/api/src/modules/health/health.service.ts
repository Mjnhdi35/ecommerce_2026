import { MongoConnection } from '../../database/connection';
import { Logger, LoggerFactory } from '../../shared/logger/logger.service';

export class HealthService {
  private logger: Logger;
  private mongoConnection: MongoConnection;

  constructor({
    loggerFactory,
    mongoConnection,
  }: {
    loggerFactory: LoggerFactory;
    mongoConnection: MongoConnection;
  }) {
    this.logger = loggerFactory.create("Health");
    this.mongoConnection = mongoConnection;
  }

  public getHealthStatus = async () => {
    try {
      const dbConnected = await this.mongoConnection.ping();

      this.logger.info('Health check performed', { databaseConnected: dbConnected });

      return {
        timestamp: new Date().toISOString(),
        nodeVersion: process.version,
        env: process.env.NODE_ENV || "No Environment",
        databaseConnected: dbConnected,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
      };
    } catch (error) {
      this.logger.error('Health check failed', error);

      return {
        timestamp: new Date().toISOString(),
        nodeVersion: process.version,
        env: process.env.NODE_ENV || "No Environment",
        databaseConnected: false,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };
}
