import { Router } from 'express';
import { MongoController } from '../controllers/mongo.controller';

const router = Router();
const mongoController = new MongoController();

router.get('/mongo-status', mongoController.getMongoStatus);

export default router;