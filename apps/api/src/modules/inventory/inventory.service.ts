import { ObjectId } from "mongodb";
import { HttpError } from "../../shared/errors/http-error";
import { Product } from "../products/product.model";
import { InventoryRepository } from "./inventory.repository";

const RESERVATION_TTL_MS = 15 * 60 * 1000;

export interface ReserveStockInput {
  orderId: ObjectId;
  productId: ObjectId;
  quantity: number;
  userId: ObjectId;
}

export class InventoryService {
  private inventoryRepository: InventoryRepository;

  constructor({
    inventoryRepository,
  }: {
    inventoryRepository: InventoryRepository;
  }) {
    this.inventoryRepository = inventoryRepository;
  }

  public async reserveStock(input: ReserveStockInput): Promise<Product> {
    const product = await this.inventoryRepository.reserveProductStock({
      productId: input.productId,
      quantity: input.quantity,
    });

    if (!product) {
      throw new HttpError(409, "Insufficient stock");
    }

    const now = new Date();
    await this.inventoryRepository.insertReservation({
      createdAt: now,
      expiresAt: new Date(now.getTime() + RESERVATION_TTL_MS),
      orderId: input.orderId,
      productId: input.productId,
      quantity: input.quantity,
      status: "reserved",
      updatedAt: now,
      userId: input.userId,
    });

    return product;
  }

  public async releaseOrderReservations(orderId: ObjectId): Promise<void> {
    const reservations = await this.inventoryRepository.findReservedByOrderId(
      orderId,
    );

    await Promise.all(
      reservations.map((reservation) =>
        this.inventoryRepository.releaseProductStock({
          productId: reservation.productId,
          quantity: reservation.quantity,
        }),
      ),
    );

    await this.inventoryRepository.releaseReservationsByOrderId(orderId);
  }
}
