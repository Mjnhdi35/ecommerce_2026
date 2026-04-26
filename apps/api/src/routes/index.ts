import { Router } from 'express';
import { AuthRoutes } from "../modules/auth";
import { CartRoutes } from "../modules/cart";
import { CategoryRoutes } from "../modules/categories";
import { HealthRoutes } from '../modules/health';
import { MongoRoutes } from '../modules/mongo';
import { OrderRoutes } from "../modules/orders";
import { PaymentRoutes } from "../modules/payments";
import { ProductRoutes } from "../modules/products";
import { UserRoutes } from "../modules/users";
import { ApiResponse } from "../shared/http/response";
import { CsrfMiddleware } from "../shared/middlewares/csrf.middleware";
import { RouteDefinition } from "../shared/routes/base.routes";

export class ApiRoutes {
  private router: Router;
  private authRoutes: AuthRoutes;
  private cartRoutes: CartRoutes;
  private categoryRoutes: CategoryRoutes;
  private csrfMiddleware: CsrfMiddleware;
  private healthRoutes: HealthRoutes;
  private mongoRoutes: MongoRoutes;
  private orderRoutes: OrderRoutes;
  private paymentRoutes: PaymentRoutes;
  private productRoutes: ProductRoutes;
  private userRoutes: UserRoutes;

  constructor({
    authRoutes,
    cartRoutes,
    categoryRoutes,
    csrfMiddleware,
    healthRoutes,
    mongoRoutes,
    orderRoutes,
    paymentRoutes,
    productRoutes,
    userRoutes,
  }: {
    authRoutes: AuthRoutes;
    cartRoutes: CartRoutes;
    categoryRoutes: CategoryRoutes;
    csrfMiddleware: CsrfMiddleware;
    healthRoutes: HealthRoutes;
    mongoRoutes: MongoRoutes;
    orderRoutes: OrderRoutes;
    paymentRoutes: PaymentRoutes;
    productRoutes: ProductRoutes;
    userRoutes: UserRoutes;
  }) {
    this.router = Router();
    this.authRoutes = authRoutes;
    this.cartRoutes = cartRoutes;
    this.categoryRoutes = categoryRoutes;
    this.csrfMiddleware = csrfMiddleware;
    this.healthRoutes = healthRoutes;
    this.mongoRoutes = mongoRoutes;
    this.orderRoutes = orderRoutes;
    this.paymentRoutes = paymentRoutes;
    this.productRoutes = productRoutes;
    this.userRoutes = userRoutes;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get("/", (_req, res) => {
      ApiResponse.success(res, {
        message: "Welcome to Ecommerce API v1",
        endpoints: {
          csrfToken: "/csrf-token",
          health: "/health",
        },
      });
    });
    this.router.get("/csrf-token", this.csrfMiddleware.issueToken);
    this.router.use(this.csrfMiddleware.verify);

    this.router.use("/", this.authRoutes.getRouter());

    this.router.use("/", this.cartRoutes.getRouter());

    this.router.use("/", this.categoryRoutes.getRouter());

    this.router.use('/', this.healthRoutes.getRouter());

    this.router.use('/', this.mongoRoutes.getRouter());

    this.router.use("/", this.orderRoutes.getRouter());

    this.router.use("/", this.paymentRoutes.getRouter());

    this.router.use("/", this.productRoutes.getRouter());

    this.router.use("/", this.userRoutes.getRouter());
  }

  public getRouter(): Router {
    return this.router;
  }

  public getRoutes(): RouteDefinition[] {
    return [
      { method: "GET", path: "/", access: "public" },
      { method: "GET", path: "/csrf-token", access: "public" },
      ...this.authRoutes.getRoutes(),
      ...this.cartRoutes.getRoutes(),
      ...this.categoryRoutes.getRoutes(),
      ...this.healthRoutes.getRoutes(),
      ...this.mongoRoutes.getRoutes(),
      ...this.orderRoutes.getRoutes(),
      ...this.paymentRoutes.getRoutes(),
      ...this.productRoutes.getRoutes(),
      ...this.userRoutes.getRoutes(),
    ];
  }
}
