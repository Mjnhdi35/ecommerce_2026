import { Router, Request, Response, NextFunction } from 'express';
import { container } from '../container';
import { MongoController } from '../controllers/mongo.controller';

export class MongoRoutes {
  private router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/mongo-status', this.getMongoStatus);
  }

  private getMongoStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const mongoController = container.resolve<MongoController>('mongoController');
      await mongoController.getMongoStatus(req, res);
    } catch (error) {
      next(error);
    }
  };

  public getRouter(): Router {
    return this.router;
  }
}