import { Response } from "express";
import { Controller } from "../../shared/http/controller";
import { AuthenticatedRequest } from "../auth/auth.middleware";
import { cartItemDto, updateCartItemDto } from "./cart.dto";
import { CartService } from "./cart.service";

export class CartController extends Controller {
  private cartService: CartService;

  constructor({ cartService }: { cartService: CartService }) {
    super();
    this.cartService = cartService;
  }

  public getCart = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    const cart = await this.cartService.getCart(this.userId(req));

    this.ok(res, cart);
  };

  public addItem = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    const payload = cartItemDto.parse(req.body);
    const cart = await this.cartService.addItem({
      ...payload,
      userId: this.userId(req),
    });

    this.created(res, cart);
  };

  public updateItem = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    const payload = updateCartItemDto.parse(req.body);
    const cart = await this.cartService.updateItem({
      productId: this.requiredParam(req, "productId", "Invalid product id"),
      quantity: payload.quantity,
      userId: this.userId(req),
    });

    this.ok(res, cart);
  };

  public removeItem = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    const cart = await this.cartService.removeItem({
      productId: this.requiredParam(req, "productId", "Invalid product id"),
      userId: this.userId(req),
    });

    this.ok(res, cart);
  };

  public clearCart = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    await this.cartService.clear(this.userId(req));

    this.noContent(res);
  };
}
