/* eslint-disable no-console */
import express, { Express } from "express";
import dotenv from "dotenv";
import apiRoutes from "./routes";

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
    // Root route
    this.app.get("/", (_req, res) => {
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

    // API routes
    this.app.use("/", apiRoutes);
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