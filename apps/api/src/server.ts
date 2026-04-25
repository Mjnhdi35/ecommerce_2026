import { App } from "./app";
import { connectToDatabase, disconnectFromDatabase } from "./database/connection";
import { Logger } from "./services/logger.service";

const logger = new Logger('Server');
const application = new App();

// Graceful shutdown
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

// Start the server
(async () => {
  try {
    // Connect to database first
    await connectToDatabase();

    // Start the server
    application.start();
  } catch (error) {
    logger.error('Failed to start server', error);
    await disconnectFromDatabase();
    process.exit(1);
  }
})();