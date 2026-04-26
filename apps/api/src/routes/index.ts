import { Router } from 'express';
import { HealthRoutes } from './health.routes';
import { MongoRoutes } from './mongo.routes';
import { UserRoutes } from "./user.routes";

export class ApiRoutes {
  private router: Router;
  private healthRoutes: HealthRoutes;
  private mongoRoutes: MongoRoutes;
  private userRoutes: UserRoutes;

  constructor() {
    this.router = Router();
    this.healthRoutes = new HealthRoutes();
    this.mongoRoutes = new MongoRoutes();
    this.userRoutes = new UserRoutes();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.use('/', this.healthRoutes.getRouter());

    this.router.use('/', this.mongoRoutes.getRouter());

    this.router.use("/", this.userRoutes.getRouter());
  }

  public getRouter(): Router {
    return this.router;
  }
}

const apiRoutesInstance = new ApiRoutes();
export default apiRoutesInstance.getRouter();
