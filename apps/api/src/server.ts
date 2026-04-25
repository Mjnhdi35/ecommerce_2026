import { App } from "./app";
import { connectToDatabase, disconnectFromDatabase } from "./database/connection";

const application = new App();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT. Graceful shutdown...');
  await disconnectFromDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM. Graceful shutdown...');
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
    console.error('Failed to start server:', error);
    await disconnectFromDatabase();
    process.exit(1);
  }
})();
