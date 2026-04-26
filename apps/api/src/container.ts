import { createContainer, asClass, asValue, InjectionMode } from 'awilix';
import { HealthController } from './controllers/health.controller';
import { MongoController } from './controllers/mongo.controller';
import { UserController } from "./controllers/user.controller";
import { HealthService } from './services/health.service';
import { MongoService } from './services/mongo.service';
import { UserService } from "./services/user.service";
import { environment } from "./config/environment";

export const container = createContainer({
  injectionMode: InjectionMode.PROXY,
});

container.register({
  healthController: asClass(HealthController).singleton(),
  mongoController: asClass(MongoController).singleton(),
  userController: asClass(UserController).singleton(),

  healthService: asClass(HealthService).singleton(),
  mongoService: asClass(MongoService).singleton(),
  userService: asClass(UserService).singleton(),

  dbName: asValue(environment.DB_NAME),
});
