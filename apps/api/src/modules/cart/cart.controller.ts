import { Request, Response } from "express";
import { HttpError } from "../../shared/errors/http-error";
import { ApiResponse } from "../../shared/http/response";
import { AuthenticatedRequest } from "../auth/auth.middleware";
import { cartItemDto, updateCartItemDto } from "./cart.dto";
import { CartService } from "./cart.service";

export class CartController {
  private cartService: CartService;

  constructor({ cartService }: { cartService: CartService }) {
    this.cartService = cartService;
  }

  public getCart = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    const cart = await this.cartService.getCart(this.getUserId(req));

    ApiResponse.success(res, cart);
  };

  public addItem = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    const payload = cartItemDto.parse(req.body);
    const cart = await this.cartService.addItem({
      ...payload,
      userId: this.getUserId(req),
    });

    ApiResponse.success(res, cart, 201);
  };

  public updateItem = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    const payload = updateCartItemDto.parse(req.body);
    const cart = await this.cartService.updateItem({
      productId: this.getProductIdParam(req),
      quantity: payload.quantity,
      userId: this.getUserId(req),
    });

    ApiResponse.success(res, cart);
  };

  public removeItem = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    const cart = await this.cartService.removeItem({
      productId: this.getProductIdParam(req),
      userId: this.getUserId(req),
    });

    ApiResponse.success(res, cart);
  };

  public clearCart = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    await this.cartService.clear(this.getUserId(req));

    ApiResponse.noContent(res);
  };

  private getProductIdParam(req: Request): string {
    const { productId } = req.params;

    if (typeof productId !== "string") {
      throw new HttpError(400, "Invalid product id");
    }

    return productId;
  }

  private getUserId(req: AuthenticatedRequest): string {
    if (!req.user) {
      throw new HttpError(401, "Authentication is required");
    }

    return req.user.id;
  }
}
