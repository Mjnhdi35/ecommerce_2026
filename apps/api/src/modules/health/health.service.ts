import { pingDatabase } from '../../database/connection';
import { Logger } from '../../shared/logger/logger.service';

const logger = new Logger('Health');

export class HealthService {
  public getHealthStatus = async () => {
    try {
      const dbConnected = await pingDatabase();

      logger.info('Health check performed', { databaseConnected: dbConnected });

      return {
        status: "OK",
        message: "Express 5 API is running",
        timestamp: new Date().toISOString(),
        nodeVersion: process.version,
        env: process.env.NODE_ENV || "No Environment",
        databaseConnected: dbConnected,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
      };
    } catch (error) {
      logger.error('Health check failed', error);

      return {
        status: "WARNING",
        message: "Express 5 API is running but database connection failed",
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
