import { createContainer, asClass, asValue, InjectionMode } from 'awilix';
import { HealthController } from './controllers/health.controller';
import { MongoController } from './controllers/mongo.controller';
import { HealthService } from './services/health.service';
import { MongoService } from './services/mongo.service';

export const container = createContainer({
  injectionMode: InjectionMode.CLASSIC,
});

container.register({
  healthController: asClass(HealthController).singleton(),
  mongoController: asClass(MongoController).singleton(),

  healthService: asClass(HealthService).singleton(),
  mongoService: asClass(MongoService).singleton(),

  dbName: asValue('ecommerce'),
});

