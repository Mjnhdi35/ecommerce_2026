import { App } from "./app";
import { connectToDatabase, disconnectFromDatabase } from "./database/connection";

const application = new App();

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

(async () => {
  try {
    await connectToDatabase();

    application.start();
  } catch (error) {
    console.error('Failed to start server:', error);
    await disconnectFromDatabase();
    process.exit(1);
  }
})();
