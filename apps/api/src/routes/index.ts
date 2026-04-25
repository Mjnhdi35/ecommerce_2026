import { Router } from 'express';
import healthRoutes from './health.routes';
import mongoRoutes from './mongo.routes';

const router = Router();

// Health check routes
router.use('/', healthRoutes);

// MongoDB routes
router.use('/', mongoRoutes);

export default router;