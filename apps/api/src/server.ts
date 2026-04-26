import "./config/loadEnv";
import { Server } from "http";
import { App } from "./app";
import { container, registerDatabase } from "./container";
import { MongoConnection } from "./database/connection";
import { LoggerFactory } from "./shared/logger/logger.service";

const loggerFactory = container.resolve<LoggerFactory>("loggerFactory");
const logger = loggerFactory.create("Server");
const mongoConnection = container.resolve<MongoConnection>("mongoConnection");
let httpServer: Server | undefined;

const shutdown = async (signal: string): Promise<void> => {
  logger.info(`Received ${signal}. Graceful shutdown...`);

  try {
    if (httpServer?.listening) {
      await new Promise<void>((resolve, reject) => {
        httpServer?.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });
    }

    await mongoConnection.disconnect();
    process.exit(0);
  } catch (error) {
    logger.error("Graceful shutdown failed", error);
    process.exit(1);
  }
};

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
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
    httpServer = application.start();
  } catch (error) {
    logger.error("Failed to start server", error);
    await mongoConnection.disconnect();
    process.exit(1);
  }
})();
