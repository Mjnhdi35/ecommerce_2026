import express, { Express } from "express";
import { ApiRoutes } from "./routes";
import { ApiResponse } from "./shared/http/response";
import { errorHandler } from "./shared/middlewares/error.middleware";
import { notFound } from "./shared/middlewares/not-found.middleware";
import { Logger } from "./shared/logger/logger.service";

const logger = new Logger("App");

export class App {
  private app: Express;
  private port: number;
  private apiRoutes: ApiRoutes;

  constructor({ apiRoutes }: { apiRoutes: ApiRoutes }) {
    this.app = express();
    this.apiRoutes = apiRoutes;
    this.port = parseInt(process.env.PORT || "3000", 10);
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private setupRoutes(): void {
    this.app.get("/", (_req, res) => {
      ApiResponse.success(res, {
        message: "Welcome to Express 5 API",
        version: "1.0.0",
        endpoints: {
          health: "/health",
        },
      });
    });

    this.app.use("/", this.apiRoutes.getRouter());

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
      logger.info(
        `Express API server started on http://localhost:${this.port} (${process.env.NODE_ENV || "development"})`,
      );
    });
  }
}
