import { Request, Response } from 'express';
import { ApiResponse } from '../../shared/http/response';
import { HealthService } from './health.service';

export class HealthController {
  private healthService: HealthService;

  constructor({ healthService }: { healthService: HealthService }) {
    this.healthService = healthService;
  }

  public getHealth = async (_req: Request, res: Response): Promise<void> => {
    try {
      const healthStatus = await this.healthService.getHealthStatus();
      ApiResponse.success(res, healthStatus);
    } catch (error) {
      ApiResponse.error(
        res,
        "API is running but health check failed",
        500,
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  };
}
