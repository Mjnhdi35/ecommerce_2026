import { App } from "./app";
import { connectToDatabase, disconnectFromDatabase } from "./database/connection";
import { Logger } from "./services/logger.service";

const logger = new Logger('Server');
const application = new App();
 
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
      await connectToDatabase();
      logger.info("Database connected successfully");
    } catch (dbError) {
      logger.warn(
        "Database connection failed, starting without database",
        dbError,
      );
    }
 
    application.start();
  } catch (error) {
    logger.error('Failed to start server', error);
    await disconnectFromDatabase();
    process.exit(1);
  }
})();