import "./config/loadEnv";
import { App } from "./app";
import { container, registerDatabase } from "./container";
import { MongoConnection } from "./database/connection";
import { LoggerFactory } from "./shared/logger/logger.service";

const loggerFactory = container.resolve<LoggerFactory>("loggerFactory");
const logger = loggerFactory.create('Server');
const mongoConnection = container.resolve<MongoConnection>("mongoConnection");
 
process.on('SIGINT', async () => {
  logger.info('Received SIGINT. Graceful shutdown...');
  await mongoConnection.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM. Graceful shutdown...');
  await mongoConnection.disconnect();
  process.exit(0);
});

 
(async () => {
  try {
    
    try {
      const db = await mongoConnection.connect();
      registerDatabase(db);
    } catch (dbError) {
      logger.warn(
        "Database connection failed, API startup aborted",
        dbError,
      );
      throw dbError;
    }

    const application = container.resolve<App>("app");
    application.start();
  } catch (error) {
    logger.error('Failed to start server', error);
    await mongoConnection.disconnect();
    process.exit(1);
  }
})();
