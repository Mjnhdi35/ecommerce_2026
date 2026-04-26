import { BaseRoutes } from '../../shared/routes/base.routes';
import { AuthMiddleware } from '../auth/auth.middleware';
import { MongoController } from './mongo.controller';

export class MongoRoutes extends BaseRoutes {
  private authMiddleware: AuthMiddleware;
  private mongoController: MongoController;

  constructor({
    authMiddleware,
    mongoController,
  }: {
    authMiddleware: AuthMiddleware;
    mongoController: MongoController;
  }) {
    super();
    this.authMiddleware = authMiddleware;
    this.mongoController = mongoController;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.route("get", "/mongo-status", "admin", this.authMiddleware.authenticate, this.authMiddleware.requireRoles("admin"), this.mongoController.getMongoStatus);
  }
}
