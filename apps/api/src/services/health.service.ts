import { isDatabaseConnected } from '../database/connection';

export class HealthService {
  public getHealthStatus = () => {
    const dbConnected = isDatabaseConnected();

    return {
      status: "OK",
      message: "Express 5 API is running",
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      env: process.env.NODE_ENV || "No Environment",
      databaseConnected: dbConnected,
    };
  };
}