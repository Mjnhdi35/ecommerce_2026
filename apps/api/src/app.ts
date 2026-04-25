import express, { Express } from "express";
import dotenv from "dotenv";
import apiRoutes from "./routes";
import { errorHandler } from "./middlewares/error.middleware";
import { notFound } from "./middlewares/notFound.middleware";
import { Logger } from "./services/logger.service";

const logger = new Logger("App");

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
   
    this.app.get("/", (_req, res) => {
      res.json({
        message: "Welcome to Express 5 API",
        version: "1.0.0",
        endpoints: {
          health: "/health",
        },
      });
    });

    this.app.use("/", apiRoutes);

    this.app.use((req, res, next) => {
      notFound(req, res, next);
    });

    
    this.app.use(errorHandler);
  }

  public getApp(): Express {
    return this.app;
  }

  public start(): void {
    this.app.listen(this.port, () => {
      logger.info(`Express 5 API server running on port ${this.port}`);
      logger.info(`Health check: http://localhost:${this.port}/health`);
      logger.info(`API: http://localhost:${this.port}/`);
      logger.info(`Environment: ${process.env.NODE_ENV || "No Environment"}`);
    });
  }
}