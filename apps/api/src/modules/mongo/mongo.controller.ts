import { Request, Response } from 'express';
import { Controller } from '../../shared/http/controller';
import { MongoService } from './mongo.service';

export class MongoController extends Controller {
  private mongoService: MongoService;

  constructor({ mongoService }: { mongoService: MongoService }) {
    super();
    this.mongoService = mongoService;
  }

  public getMongoStatus = async (_req: Request, res: Response): Promise<void> => {
    const mongoStatus = await this.mongoService.getMongoStatus();
    this.ok(res, mongoStatus);
  };
}
