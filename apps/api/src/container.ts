import { Db } from "mongodb";
import { createContainer, asClass, asValue, InjectionMode } from 'awilix';
import { App } from "./app";
import { HealthController } from './controllers/health.controller';
import { MongoController } from './controllers/mongo.controller';
import { AuthController } from "./controllers/auth.controller";
import { UserController } from "./controllers/user.controller";
import { AuthMiddleware } from "./middlewares/auth.middleware";
import { ApiRoutes } from "./routes";
import { AuthRoutes } from "./routes/auth.routes";
import { HealthRoutes } from "./routes/health.routes";
import { MongoRoutes } from "./routes/mongo.routes";
import { UserRoutes } from "./routes/user.routes";
import { AuthService } from "./services/auth.service";
import { HealthService } from './services/health.service';
import { MongoService } from './services/mongo.service';
import { UserService } from "./services/user.service";
import { environment } from "./config/environment";

export const container = createContainer({
  injectionMode: InjectionMode.PROXY,
});

container.register({
  app: asClass(App).singleton(),

  apiRoutes: asClass(ApiRoutes).singleton(),
  authRoutes: asClass(AuthRoutes).singleton(),
  healthRoutes: asClass(HealthRoutes).singleton(),
  mongoRoutes: asClass(MongoRoutes).singleton(),
  userRoutes: asClass(UserRoutes).singleton(),

  authController: asClass(AuthController).singleton(),
  healthController: asClass(HealthController).singleton(),
  mongoController: asClass(MongoController).singleton(),
  userController: asClass(UserController).singleton(),

  authMiddleware: asClass(AuthMiddleware).singleton(),

  authService: asClass(AuthService).singleton(),
  healthService: asClass(HealthService).singleton(),
  mongoService: asClass(MongoService).singleton(),
  userService: asClass(UserService).singleton(),

  dbName: asValue(environment.DB_NAME),
});

export const registerDatabase = (db: Db): void => {
  container.register({
    db: asValue(db),
  });
};
