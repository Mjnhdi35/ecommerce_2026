import { Router } from 'express';
import { AuthRoutes } from "../modules/auth";
import { HealthRoutes } from '../modules/health';
import { MongoRoutes } from '../modules/mongo';
import { UserRoutes } from "../modules/users";

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
