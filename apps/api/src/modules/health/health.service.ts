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
        status: dbConnected ? "ok" : "degraded",
        timestamp: new Date().toISOString(),
        databaseConnected: dbConnected,
      };
    } catch (error) {
      this.logger.error('Health check failed', error);

      return {
        status: "degraded",
        timestamp: new Date().toISOString(),
        databaseConnected: false,
      };
    }
  };
}
