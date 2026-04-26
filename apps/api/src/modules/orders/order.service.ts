import { ObjectId, OptionalId, WithId } from "mongodb";
import { HttpError } from "../../shared/errors/http-error";
import { AuditService } from "../audit";
import { CartService } from "../cart/cart.service";
import { InventoryService } from "../inventory";
import { ProductService } from "../products/product.service";
import { Order, OrderItem } from "./order.model";
import { OrderRepository } from "./order.repository";

export class OrderService {
  private auditService: AuditService;
  private cartService: CartService;
  private inventoryService: InventoryService;
  private orderRepository: OrderRepository;
  private productService: ProductService;

  constructor({
    auditService,
    cartService,
    inventoryService,
    orderRepository,
    productService,
  }: {
    auditService: AuditService;
    cartService: CartService;
    inventoryService: InventoryService;
    orderRepository: OrderRepository;
    productService: ProductService;
  }) {
    this.auditService = auditService;
    this.cartService = cartService;
    this.inventoryService = inventoryService;
    this.orderRepository = orderRepository;
    this.productService = productService;
  }

  public async createFromCart(userId: string): Promise<WithId<Order>> {
    const userObjectId = this.toObjectId(userId, "Invalid user id");
    const cart = await this.cartService.getRawCart(userId);

    if (!cart || cart.items.length === 0) {
      throw new HttpError(400, "Cart is empty");
    }

    const orderId = new ObjectId();
    const orderItems: OrderItem[] = [];

    try {
      for (const cartItem of cart.items) {
        const product = await this.productService.findById(
          cartItem.productId.toHexString(),
        );

        if (product.status !== "active") {
          throw new HttpError(400, "Product is not active");
        }

        await this.inventoryService.reserveStock({
          orderId,
          productId: cartItem.productId,
          quantity: cartItem.quantity,
          userId: userObjectId,
        });

        orderItems.push({
          productId: product._id,
          productName: product.name,
          productSlug: product.slug,
          quantity: cartItem.quantity,
          subtotal: product.price * cartItem.quantity,
          unitPrice: product.price,
        });
      }
    } catch (error) {
      await this.inventoryService.releaseOrderReservations(orderId);
      throw error;
    }

    const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
    const now = new Date();
    const document: OptionalId<Order> = {
      _id: orderId,
      createdAt: now,
      items: orderItems,
      status: "pending_payment",
      subtotal,
      total: subtotal,
      updatedAt: now,
      userId: userObjectId,
    };

    await this.orderRepository.insert(document);
    await this.cartService.clear(userId);
    await this.auditService.record({
      action: "ORDER_CREATED",
      entityId: orderId,
      entityType: "order",
      metadata: {
        total: subtotal,
      },
      userId: userObjectId,
    });

    return this.findByIdForUser(orderId.toHexString(), userId);
  }

  public async findByUserId(userId: string): Promise<WithId<Order>[]> {
    return this.orderRepository.findByUserId(
      this.toObjectId(userId, "Invalid user id"),
    );
  }

  public async findByIdForUser(
    orderId: string,
    userId: string,
  ): Promise<WithId<Order>> {
    const order = await this.orderRepository.findById(
      this.toObjectId(orderId, "Invalid order id"),
    );

    if (!order || !order.userId.equals(this.toObjectId(userId, "Invalid user id"))) {
      throw new HttpError(404, "Order not found");
    }

    return order;
  }

  public async cancel(orderId: string, userId: string): Promise<void> {
    const order = await this.findByIdForUser(orderId, userId);

    if (order.status !== "pending_payment") {
      throw new HttpError(400, "Only pending payment orders can be cancelled");
    }

    await this.inventoryService.releaseOrderReservations(order._id);

    const result = await this.orderRepository.update(order._id, {
      cancelledAt: new Date(),
      status: "cancelled",
      updatedAt: new Date(),
    });

    if (result.matchedCount === 0) {
      throw new HttpError(404, "Order not found");
    }

    await this.auditService.record({
      action: "ORDER_CANCELLED",
      entityId: order._id,
      entityType: "order",
      userId: order.userId,
    });
  }

  public async markPaid(orderId: ObjectId, userId: string): Promise<void> {
    const order = await this.findByIdForUser(orderId.toHexString(), userId);

    if (order.status !== "pending_payment") {
      throw new HttpError(400, "Order is not pending payment");
    }

    const result = await this.orderRepository.markPaid(orderId);

    if (result.matchedCount === 0) {
      throw new HttpError(409, "Order payment state changed");
    }

    await this.auditService.record({
      action: "ORDER_PAID",
      entityId: order._id,
      entityType: "order",
      userId: order.userId,
    });
  }

  private toObjectId(id: string, message: string): ObjectId {
    if (!ObjectId.isValid(id)) {
      throw new HttpError(400, message);
    }

    return new ObjectId(id);
  }
}
