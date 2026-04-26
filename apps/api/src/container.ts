import { Db } from "mongodb";
import { createContainer, asClass, asValue, InjectionMode } from 'awilix';
import { App } from "./app";
import {
  AuthController,
  AuthMiddleware,
  AuthRoutes,
  AuthService,
} from "./modules/auth";
import { HealthController, HealthRoutes, HealthService } from './modules/health';
import { MongoController, MongoRoutes, MongoService } from './modules/mongo';
import { UserController, UserRoutes, UserService } from "./modules/users";
import { ApiRoutes } from "./routes";
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
