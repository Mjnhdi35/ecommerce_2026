import { Request, Response } from 'express';
import { container } from '../container';
import { MongoService } from '../services/mongo.service';

export class MongoController {
  public getMongoStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const mongoService = container.resolve<MongoService>('mongoService');
      const mongoStatus = await mongoService.getMongoStatus();
      res.json(mongoStatus);
    } catch (error) {
      res.status(500).json({
        status: "ERROR",
        message: "MongoDB connection failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
}