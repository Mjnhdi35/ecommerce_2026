import express, { Express } from "express";
import dotenv from "dotenv";
import {
  connectToDatabase,
  getDatabase,
  isDatabaseConnected,
} from "./database/connection";

export class App {
  private app: Express;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || "3000", 10);
    this.setupEnvironment();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupEnvironment(): void {
    dotenv.config();
  }

  private setupMiddleware(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private setupRoutes(): void {
    this.app.get("/health", async (req, res) => {
      try {
        if (!isDatabaseConnected()) {
          await connectToDatabase();
        }
        const dbConnected = isDatabaseConnected();

        res.json({
          status: "OK",
          message: "Express 5 API is running",
          timestamp: new Date().toISOString(),
          nodeVersion: process.version,
          env: process.env.NODE_ENV || "development",
          databaseConnected: dbConnected,
        });
      } catch (error) {
        res.status(500).json({
          status: "ERROR",
          message: "API is running but database connection failed",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

    this.app.get("/mongo-status", async (req, res) => {
      try {
        if (!isDatabaseConnected()) {
          await connectToDatabase();
        }
        const db = getDatabase();
        await db.admin().ping();

        res.json({
          status: "OK",
          message: "MongoDB connected successfully",
          database: "ecommerce", // Hardcode database name or get from config
          env: process.env.NODE_ENV || "development",
        });
      } catch (error) {
        res.status(500).json({
          status: "ERROR",
          message: "MongoDB connection failed",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

    this.app.get("/", (req, res) => {
      res.json({
        message: "Welcome to Express 5 API",
        version: "1.0.0",
        endpoints: {
          health: "/health",
          mongo: "/mongo-status",
          root: "/",
        },
      });
    });
  }

  public getApp(): Express {
    return this.app;
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`🚀 Express 5 API server running on port ${this.port}`);
      console.log(`📊 Health check: http://localhost:${this.port}/health`);
      console.log(`🌐 API: http://localhost:${this.port}/`);
      console.log(
        `🔧 Environment: ${process.env.NODE_ENV || "No Environment"}`,
      );
    });
  }
}
