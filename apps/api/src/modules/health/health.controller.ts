import { Request, Response } from 'express';
import { Controller } from '../../shared/http/controller';
import { HealthService } from './health.service';

export class HealthController extends Controller {
  private healthService: HealthService;

  constructor({ healthService }: { healthService: HealthService }) {
    super();
    this.healthService = healthService;
  }

  public getHealth = async (_req: Request, res: Response): Promise<void> => {
    const healthStatus = await this.healthService.getHealthStatus();
    this.ok(res, healthStatus);
  };
}
