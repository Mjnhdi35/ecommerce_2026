import { Request, Response } from 'express';
import { MongoService } from '../services/mongo.service';

export class MongoController {
  private mongoService: MongoService;

  constructor() {
    this.mongoService = new MongoService();
  }

  public getMongoStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const mongoStatus = await this.mongoService.getMongoStatus();
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