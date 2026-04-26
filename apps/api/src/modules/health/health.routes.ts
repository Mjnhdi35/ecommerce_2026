import { BaseRoutes } from '../../shared/routes/base.routes';
import { HealthController } from './health.controller';

export class HealthRoutes extends BaseRoutes {
  private healthController: HealthController;

  constructor({ healthController }: { healthController: HealthController }) {
    super();
    this.healthController = healthController;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.route("get", "/health", "public", this.healthController.getHealth);
  }
}
