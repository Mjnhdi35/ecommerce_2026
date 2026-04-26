import { Router } from 'express';
import { AuthRoutes } from "./auth.routes";
import { HealthRoutes } from './health.routes';
import { MongoRoutes } from './mongo.routes';
import { UserRoutes } from "./user.routes";

export class ApiRoutes {
  private router: Router;
  private authRoutes: AuthRoutes;
  private healthRoutes: HealthRoutes;
  private mongoRoutes: MongoRoutes;
  private userRoutes: UserRoutes;

  constructor({
    authRoutes,
    healthRoutes,
    mongoRoutes,
    userRoutes,
  }: {
    authRoutes: AuthRoutes;
    healthRoutes: HealthRoutes;
    mongoRoutes: MongoRoutes;
    userRoutes: UserRoutes;
  }) {
    this.router = Router();
    this.authRoutes = authRoutes;
    this.healthRoutes = healthRoutes;
    this.mongoRoutes = mongoRoutes;
    this.userRoutes = userRoutes;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.use("/", this.authRoutes.getRouter());

    this.router.use('/', this.healthRoutes.getRouter());

    this.router.use('/', this.mongoRoutes.getRouter());

    this.router.use("/", this.userRoutes.getRouter());
  }

  public getRouter(): Router {
    return this.router;
  }
}
