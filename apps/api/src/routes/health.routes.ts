import { Router, Request, Response, NextFunction } from 'express';
import { container } from '../container';
import { HealthController } from '../controllers/health.controller';

export class HealthRoutes {
  private router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/health', this.getHealth);
  }

  private getHealth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const healthController = container.resolve<HealthController>('healthController');
      await healthController.getHealth(req, res);
    } catch (error) {
      next(error);
    }
  };

  public getRouter(): Router {
    return this.router;
  }
}