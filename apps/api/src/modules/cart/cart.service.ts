import { ObjectId, WithId } from "mongodb";
import { HttpError } from "../../shared/errors/http-error";
import { ProductService } from "../products/product.service";
import { Cart, CartItem } from "./cart.model";
import { CartRepository } from "./cart.repository";

export interface CartViewItem {
  productId: string;
  quantity: number;
}

export interface CartView {
  id?: string;
  items: CartViewItem[];
  userId: string;
}

export class CartService {
  private cartRepository: CartRepository;
  private productService: ProductService;

  constructor({
    cartRepository,
    productService,
  }: {
    cartRepository: CartRepository;
    productService: ProductService;
  }) {
    this.cartRepository = cartRepository;
    this.productService = productService;
  }

  public async getCart(userId: string): Promise<CartView> {
    const userObjectId = this.toObjectId(userId, "Invalid user id");
    const cart = await this.cartRepository.findByUserId(userObjectId);

    return this.toCartView(cart, userObjectId);
  }

  public async addItem({
    productId,
    quantity,
    userId,
  }: {
    productId: string;
    quantity: number;
    userId: string;
  }): Promise<CartView> {
    const userObjectId = this.toObjectId(userId, "Invalid user id");
    const productObjectId = this.toObjectId(productId, "Invalid product id");
    const cart = await this.getOrCreateCart(userObjectId);
    const existingItem = cart.items.find((item) =>
      item.productId.equals(productObjectId),
    );
    const nextQuantity = (existingItem?.quantity || 0) + quantity;

    await this.assertProductCanBeAdded(productId, nextQuantity);

    const now = new Date();

    if (existingItem) {
      existingItem.quantity = nextQuantity;
      existingItem.updatedAt = now;
    } else {
      cart.items.push({
        createdAt: now,
        productId: productObjectId,
        quantity,
        updatedAt: now,
      });
    }

    cart.updatedAt = now;

    return this.toCartView(await this.cartRepository.save(cart), userObjectId);
  }

  public async updateItem({
    productId,
    quantity,
    userId,
  }: {
    productId: string;
    quantity: number;
    userId: string;
  }): Promise<CartView> {
    const userObjectId = this.toObjectId(userId, "Invalid user id");
    const productObjectId = this.toObjectId(productId, "Invalid product id");
    const cart = await this.getOrCreateCart(userObjectId);
    const item = cart.items.find((cartItem) =>
      cartItem.productId.equals(productObjectId),
    );

    if (!item) {
      throw new HttpError(404, "Cart item not found");
    }

    await this.assertProductCanBeAdded(productId, quantity);

    item.quantity = quantity;
    item.updatedAt = new Date();
    cart.updatedAt = new Date();

    return this.toCartView(await this.cartRepository.save(cart), userObjectId);
  }

  public async removeItem({
    productId,
    userId,
  }: {
    productId: string;
    userId: string;
  }): Promise<CartView> {
    const userObjectId = this.toObjectId(userId, "Invalid user id");
    const productObjectId = this.toObjectId(productId, "Invalid product id");
    const cart = await this.getOrCreateCart(userObjectId);
    const originalLength = cart.items.length;

    cart.items = cart.items.filter((item) => !item.productId.equals(productObjectId));

    if (cart.items.length === originalLength) {
      throw new HttpError(404, "Cart item not found");
    }

    cart.updatedAt = new Date();

    return this.toCartView(await this.cartRepository.save(cart), userObjectId);
  }

  public async clear(userId: string): Promise<void> {
    await this.cartRepository.clear(this.toObjectId(userId, "Invalid user id"));
  }

  public async getRawCart(userId: string): Promise<WithId<Cart> | null> {
    return this.cartRepository.findByUserId(
      this.toObjectId(userId, "Invalid user id"),
    );
  }

  private async getOrCreateCart(userId: ObjectId): Promise<Cart> {
    const existingCart = await this.cartRepository.findByUserId(userId);

    if (existingCart) {
      return existingCart;
    }

    const now = new Date();

    return {
      createdAt: now,
      items: [],
      updatedAt: now,
      userId,
    };
  }

  private async assertProductCanBeAdded(
    productId: string,
    quantity: number,
  ): Promise<void> {
    const product = await this.productService.findById(productId);

    if (product.status !== "active") {
      throw new HttpError(400, "Product is not active");
    }

    if (product.stock < quantity) {
      throw new HttpError(409, "Insufficient stock");
    }
  }

  private toCartView(cart: WithId<Cart> | null, userId: ObjectId): CartView {
    return {
      id: cart?._id.toHexString(),
      items: (cart?.items || []).map((item: CartItem) => ({
        productId: item.productId.toHexString(),
        quantity: item.quantity,
      })),
      userId: userId.toHexString(),
    };
  }

  private toObjectId(id: string, message: string): ObjectId {
    if (!ObjectId.isValid(id)) {
      throw new HttpError(400, message);
    }

    return new ObjectId(id);
  }
}
