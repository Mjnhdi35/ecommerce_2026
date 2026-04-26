import { Response } from "express";
import { HttpError } from "../../shared/errors/http-error";
import { ApiResponse } from "../../shared/http/response";
import { AuthenticatedRequest } from "../auth/auth.middleware";
import { OrderService } from "./order.service";

export class OrderController {
  private orderService: OrderService;

  constructor({ orderService }: { orderService: OrderService }) {
    this.orderService = orderService;
  }

  public createOrder = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    const order = await this.orderService.createFromCart(this.getUserId(req));

    ApiResponse.success(res, order, 201);
  };

  public getOrders = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    const orders = await this.orderService.findByUserId(this.getUserId(req));

    ApiResponse.success(res, orders);
  };

  public getOrderById = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    const order = await this.orderService.findByIdForUser(
      this.getOrderId(req),
      this.getUserId(req),
    );

    ApiResponse.success(res, order);
  };

  public cancelOrder = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    await this.orderService.cancel(this.getOrderId(req), this.getUserId(req));

    ApiResponse.noContent(res);
  };

  private getOrderId(req: AuthenticatedRequest): string {
    const { id } = req.params;

    if (typeof id !== "string") {
      throw new HttpError(400, "Invalid order id");
    }

    return id;
  }

  private getUserId(req: AuthenticatedRequest): string {
    if (!req.user) {
      throw new HttpError(401, "Authentication is required");
    }

    return req.user.id;
  }
}
