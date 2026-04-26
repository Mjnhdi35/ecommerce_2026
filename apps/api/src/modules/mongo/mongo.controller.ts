import { Request, Response } from 'express';
import { ApiResponse } from '../../shared/http/response';
import { MongoService } from './mongo.service';

export class MongoController {
  private mongoService: MongoService;

  constructor({ mongoService }: { mongoService: MongoService }) {
    this.mongoService = mongoService;
  }

  public getMongoStatus = async (_req: Request, res: Response): Promise<void> => {
    try {
      const mongoStatus = await this.mongoService.getMongoStatus();
      ApiResponse.success(res, mongoStatus);
    } catch (error) {
      ApiResponse.error(
        res,
        "MongoDB connection failed",
        500,
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  };
}
