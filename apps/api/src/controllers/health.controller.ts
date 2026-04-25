import { Request, Response } from 'express';
import { container } from '../container';
import { HealthService } from '../services/health.service';

export class HealthController {
  public getHealth = async (req: Request, res: Response): Promise<void> => {
    try {
      const healthService = container.resolve<HealthService>('healthService');
      const healthStatus = await healthService.getHealthStatus();
      res.json(healthStatus);
    } catch (error) {
      res.status(500).json({
        status: "ERROR",
        message: "API is running but database connection failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
}