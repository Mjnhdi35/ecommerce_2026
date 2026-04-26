import { Response } from "express";
import { Controller } from "../../shared/http/controller";
import { AuthenticatedRequest } from "../auth/auth.middleware";
import { OrderService } from "./order.service";

export class OrderController extends Controller {
  private orderService: OrderService;

  constructor({ orderService }: { orderService: OrderService }) {
    super();
    this.orderService = orderService;
  }

  public createOrder = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    const order = await this.orderService.createFromCart(this.userId(req));

    this.created(res, order);
  };

  public getOrders = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    const orders = await this.orderService.findByUserId(this.userId(req));

    this.ok(res, orders);
  };

  public getOrderById = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    const order = await this.orderService.findByIdForUser(
      this.requiredParam(req, "id", "Invalid order id"),
      this.userId(req),
    );

    this.ok(res, order);
  };

  public cancelOrder = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    await this.orderService.cancel(
      this.requiredParam(req, "id", "Invalid order id"),
      this.userId(req),
    );

    this.noContent(res);
  };
}
