import { Request, Response } from 'express';
import { HealthService } from '../services/health.service';

export class HealthController {
  private healthService: HealthService;

  constructor() {
    this.healthService = new HealthService();
  }

  public getHealth = async (req: Request, res: Response): Promise<void> => {
    try {
      const healthStatus = await this.healthService.getHealthStatus();
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