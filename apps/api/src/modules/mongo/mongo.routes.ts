import { BaseRoutes } from '../../shared/routes/base.routes';
import { MongoController } from './mongo.controller';

export class MongoRoutes extends BaseRoutes {
  private mongoController: MongoController;

  constructor({ mongoController }: { mongoController: MongoController }) {
    super();
    this.mongoController = mongoController;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      '/mongo-status',
      this.handle(this.mongoController, this.mongoController.getMongoStatus),
    );
  }
}
