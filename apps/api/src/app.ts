import express, { Express } from "express";
import cookieParser from "cookie-parser";
import { Server } from "http";
import { environment } from "./config/environment";
import { ApiRoutes } from "./routes";
import { ApiResponse } from "./shared/http/response";
import { ErrorMiddleware } from "./shared/middlewares/error.middleware";
import { NotFoundMiddleware } from "./shared/middlewares/not-found.middleware";
import { RequestMiddleware } from "./shared/middlewares/request.middleware";
import { SecurityMiddleware } from "./shared/middlewares/security.middleware";
import { Logger, LoggerFactory } from "./shared/logger/logger.service";

export class App {
  private app: Express;
  private port: number;
  private apiRoutes: ApiRoutes;
  private errorMiddleware: ErrorMiddleware;
  private logger: Logger;
  private notFoundMiddleware: NotFoundMiddleware;
  private requestMiddleware: RequestMiddleware;
  private routeLogger: Logger;
  private securityMiddleware: SecurityMiddleware;

  constructor({
    apiRoutes,
    errorMiddleware,
    loggerFactory,
    notFoundMiddleware,
    requestMiddleware,
    securityMiddleware,
  }: {
    apiRoutes: ApiRoutes;
    errorMiddleware: ErrorMiddleware;
    loggerFactory: LoggerFactory;
    notFoundMiddleware: NotFoundMiddleware;
    requestMiddleware: RequestMiddleware;
    securityMiddleware: SecurityMiddleware;
  }) {
    this.app = express();
    this.apiRoutes = apiRoutes;
    this.errorMiddleware = errorMiddleware;
    this.logger = loggerFactory.create("App");
    this.notFoundMiddleware = notFoundMiddleware;
    this.requestMiddleware = requestMiddleware;
    this.routeLogger = loggerFactory.create("Route");
    this.securityMiddleware = securityMiddleware;
    this.port = environment.PORT;
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.disable("x-powered-by");
    this.app.use(this.requestMiddleware.handle);
    this.app.use(this.securityMiddleware.helmet);
    this.app.use(this.securityMiddleware.cors);
    this.app.use(cookieParser());
    this.app.use(express.json({ limit: environment.BODY_LIMIT }));
    this.app.use(
      express.urlencoded({ extended: true, limit: environment.BODY_LIMIT }),
    );
  }

  private setupRoutes(): void {
    this.app.get("/", (_req, res) => {
      ApiResponse.success(res, {
        message: "Ecommerce API",
        version: "1.0.0",
        api: environment.API_PREFIX,
      });
    });

    this.app.use(environment.API_PREFIX, this.apiRoutes.getRouter());

    this.app.use(this.notFoundMiddleware.handle);

    this.app.use(this.errorMiddleware.handle);
  }

  public getApp(): Express {
    return this.app;
  }

  public start(): Server {
    const server = this.app.listen(this.port, () => {
      this.logger.info(
        `Express API server started on http://localhost:${this.port}${environment.API_PREFIX} (${environment.NODE_ENV})`,
      );
      this.logRegisteredRoutes();
    });

    return server;
  }

  private logRegisteredRoutes(): void {
    const routes = [
      { method: "GET", path: "/", access: "public" },
      ...this.apiRoutes.getRoutes().map((route) => ({
        ...route,
        path: `${environment.API_PREFIX}${route.path === "/" ? "" : route.path}`,
      })),
    ];

    this.logger.info(`Registered ${routes.length} routes`);

    routes.forEach((route) => {
      this.routeLogger.info(
        `${route.method} ${route.path} [${route.access || "public"}]`,
      );
    });
  }
}
