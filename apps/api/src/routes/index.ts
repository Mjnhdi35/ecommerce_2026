import { Router } from 'express';
import { AuthRoutes } from "../modules/auth";
import { HealthRoutes } from '../modules/health';
import { MongoRoutes } from '../modules/mongo';
import { ProductRoutes } from "../modules/products";
import { UserRoutes } from "../modules/users";
import { RouteDefinition } from "../shared/routes/base.routes";

export class ApiRoutes {
  private router: Router;
  private authRoutes: AuthRoutes;
  private healthRoutes: HealthRoutes;
  private mongoRoutes: MongoRoutes;
  private productRoutes: ProductRoutes;
  private userRoutes: UserRoutes;

  constructor({
    authRoutes,
    healthRoutes,
    mongoRoutes,
    productRoutes,
    userRoutes,
  }: {
    authRoutes: AuthRoutes;
    healthRoutes: HealthRoutes;
    mongoRoutes: MongoRoutes;
    productRoutes: ProductRoutes;
    userRoutes: UserRoutes;
  }) {
    this.router = Router();
    this.authRoutes = authRoutes;
    this.healthRoutes = healthRoutes;
    this.mongoRoutes = mongoRoutes;
    this.productRoutes = productRoutes;
    this.userRoutes = userRoutes;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.use("/", this.authRoutes.getRouter());

    this.router.use('/', this.healthRoutes.getRouter());

    this.router.use('/', this.mongoRoutes.getRouter());

    this.router.use("/", this.productRoutes.getRouter());

    this.router.use("/", this.userRoutes.getRouter());
  }

  public getRouter(): Router {
    return this.router;
  }

  public getRoutes(): RouteDefinition[] {
    return [
      { method: "GET", path: "/", access: "public" },
      ...this.authRoutes.getRoutes(),
      ...this.healthRoutes.getRoutes(),
      ...this.mongoRoutes.getRoutes(),
      ...this.productRoutes.getRoutes(),
      ...this.userRoutes.getRoutes(),
    ];
  }
}
