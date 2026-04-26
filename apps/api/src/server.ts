import "./config/loadEnv";
import { App } from "./app";
import { container, registerDatabase } from "./container";
import { connectToDatabase, disconnectFromDatabase } from "./database/connection";
import { Logger } from "./shared/logger/logger.service";

const logger = new Logger('Server');
 
process.on('SIGINT', async () => {
  logger.info('Received SIGINT. Graceful shutdown...');
  await disconnectFromDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM. Graceful shutdown...');
  await disconnectFromDatabase();
  process.exit(0);
});

 
(async () => {
  try {
    
    try {
      const db = await connectToDatabase();
      registerDatabase(db);
      logger.info("Database connected successfully");
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
    await disconnectFromDatabase();
    process.exit(1);
  }
})();
