import express, { Express } from "express";
import { environment } from "./config/environment";
import { ApiRoutes } from "./routes";
import { ApiResponse } from "./shared/http/response";
import { ErrorMiddleware } from "./shared/middlewares/error.middleware";
import { NotFoundMiddleware } from "./shared/middlewares/not-found.middleware";
import { RequestMiddleware } from "./shared/middlewares/request.middleware";
import { Logger, LoggerFactory } from "./shared/logger/logger.service";

export class App {
  private app: Express;
  private port: number;
  private apiRoutes: ApiRoutes;
  private errorMiddleware: ErrorMiddleware;
  private logger: Logger;
  private notFoundMiddleware: NotFoundMiddleware;
  private requestMiddleware: RequestMiddleware;

  constructor({
    apiRoutes,
    errorMiddleware,
    loggerFactory,
    notFoundMiddleware,
    requestMiddleware,
  }: {
    apiRoutes: ApiRoutes;
    errorMiddleware: ErrorMiddleware;
    loggerFactory: LoggerFactory;
    notFoundMiddleware: NotFoundMiddleware;
    requestMiddleware: RequestMiddleware;
  }) {
    this.app = express();
    this.apiRoutes = apiRoutes;
    this.errorMiddleware = errorMiddleware;
    this.logger = loggerFactory.create("App");
    this.notFoundMiddleware = notFoundMiddleware;
    this.requestMiddleware = requestMiddleware;
    this.port = parseInt(process.env.PORT || "3000", 10);
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.disable("x-powered-by");
    this.app.use(this.requestMiddleware.handle);
    this.app.use(express.json({ limit: environment.BODY_LIMIT }));
    this.app.use(
      express.urlencoded({ extended: true, limit: environment.BODY_LIMIT }),
    );
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

    this.app.use(this.notFoundMiddleware.handle);

    this.app.use(this.errorMiddleware.handle);
  }

  public getApp(): Express {
    return this.app;
  }

  public start(): void {
    this.app.listen(this.port, () => {
      this.logger.info(
        `Express API server started on http://localhost:${this.port} (${process.env.NODE_ENV || "development"})`,
      );
    });
  }
}
