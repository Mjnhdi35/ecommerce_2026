import { Db } from "mongodb";
import { createContainer, asClass, asValue, InjectionMode } from 'awilix';
import { App } from "./app";
import {
  AuthController,
  AuthMiddleware,
  AuthRoutes,
  AuthService,
  BootstrapLockRepository,
  RefreshTokenRepository,
} from "./modules/auth";
import { AuditRepository, AuditService } from "./modules/audit";
import {
  CartController,
  CartRepository,
  CartRoutes,
  CartService,
} from "./modules/cart";
import {
  CategoryController,
  CategoryRepository,
  CategoryRoutes,
  CategoryService,
} from "./modules/categories";
import { HealthController, HealthRoutes, HealthService } from './modules/health';
import { InventoryRepository, InventoryService } from "./modules/inventory";
import { MongoController, MongoRoutes, MongoService } from './modules/mongo';
import {
  OrderController,
  OrderRepository,
  OrderRoutes,
  OrderService,
} from "./modules/orders";
import {
  ManualPaymentProvider,
  PaymentController,
  PaymentRepository,
  PaymentRoutes,
  PaymentService,
} from "./modules/payments";
import {
  ProductController,
  ProductRepository,
  ProductRoutes,
  ProductService,
} from "./modules/products";
import {
  UserController,
  UserRepository,
  UserRoutes,
  UserService,
} from "./modules/users";
import { ApiRoutes } from "./routes";
import { environment } from "./config/environment";
import { MongoConnection } from "./database/connection";
import { LoggerFactory } from "./shared/logger/logger.service";
import { ErrorMiddleware } from "./shared/middlewares/error.middleware";
import { NotFoundMiddleware } from "./shared/middlewares/not-found.middleware";
import { CsrfMiddleware } from "./shared/middlewares/csrf.middleware";
import { RateLimitMiddleware } from "./shared/middlewares/rate-limit.middleware";
import { RequestMiddleware } from "./shared/middlewares/request.middleware";
import { SecurityMiddleware } from "./shared/middlewares/security.middleware";

export const container = createContainer({
  injectionMode: InjectionMode.PROXY,
});

container.register({
  loggerFactory: asClass(LoggerFactory).singleton(),
  mongoConnection: asClass(MongoConnection).singleton(),

  app: asClass(App).singleton(),

  apiRoutes: asClass(ApiRoutes).singleton(),
  authRoutes: asClass(AuthRoutes).singleton(),
  cartRoutes: asClass(CartRoutes).singleton(),
  categoryRoutes: asClass(CategoryRoutes).singleton(),
  healthRoutes: asClass(HealthRoutes).singleton(),
  mongoRoutes: asClass(MongoRoutes).singleton(),
  orderRoutes: asClass(OrderRoutes).singleton(),
  paymentRoutes: asClass(PaymentRoutes).singleton(),
  productRoutes: asClass(ProductRoutes).singleton(),
  userRoutes: asClass(UserRoutes).singleton(),

  authController: asClass(AuthController).singleton(),
  cartController: asClass(CartController).singleton(),
  categoryController: asClass(CategoryController).singleton(),
  healthController: asClass(HealthController).singleton(),
  mongoController: asClass(MongoController).singleton(),
  orderController: asClass(OrderController).singleton(),
  paymentController: asClass(PaymentController).singleton(),
  productController: asClass(ProductController).singleton(),
  userController: asClass(UserController).singleton(),

  authMiddleware: asClass(AuthMiddleware).singleton(),
  csrfMiddleware: asClass(CsrfMiddleware).singleton(),
  errorMiddleware: asClass(ErrorMiddleware).singleton(),
  notFoundMiddleware: asClass(NotFoundMiddleware).singleton(),
  rateLimitMiddleware: asClass(RateLimitMiddleware).singleton(),
  requestMiddleware: asClass(RequestMiddleware).singleton(),
  securityMiddleware: asClass(SecurityMiddleware).singleton(),

  bootstrapLockRepository: asClass(BootstrapLockRepository).singleton(),
  auditRepository: asClass(AuditRepository).singleton(),
  cartRepository: asClass(CartRepository).singleton(),
  categoryRepository: asClass(CategoryRepository).singleton(),
  inventoryRepository: asClass(InventoryRepository).singleton(),
  orderRepository: asClass(OrderRepository).singleton(),
  paymentRepository: asClass(PaymentRepository).singleton(),
  productRepository: asClass(ProductRepository).singleton(),
  refreshTokenRepository: asClass(RefreshTokenRepository).singleton(),
  userRepository: asClass(UserRepository).singleton(),

  authService: asClass(AuthService).singleton(),
  auditService: asClass(AuditService).singleton(),
  cartService: asClass(CartService).singleton(),
  categoryService: asClass(CategoryService).singleton(),
  healthService: asClass(HealthService).singleton(),
  inventoryService: asClass(InventoryService).singleton(),
  manualPaymentProvider: asClass(ManualPaymentProvider).singleton(),
  mongoService: asClass(MongoService).singleton(),
  orderService: asClass(OrderService).singleton(),
  paymentService: asClass(PaymentService).singleton(),
  productService: asClass(ProductService).singleton(),
  userService: asClass(UserService).singleton(),

  dbName: asValue(environment.DB_NAME),
});

export const registerDatabase = (db: Db): void => {
  container.register({
    db: asValue(db),
  });
};
