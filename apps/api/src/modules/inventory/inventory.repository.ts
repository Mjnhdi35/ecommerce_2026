import { Collection, Db, ObjectId, OptionalId, WithId } from "mongodb";
import { Product } from "../products/product.model";
import { StockReservation } from "./stock-reservation.model";

const PRODUCTS_COLLECTION = "products";
const RESERVATIONS_COLLECTION = "stock_reservations";

export class InventoryRepository {
  private products: Collection<Product>;
  private reservations: Collection<StockReservation>;

  constructor({ db }: { db: Db }) {
    this.products = db.collection<Product>(PRODUCTS_COLLECTION);
    this.reservations = db.collection<StockReservation>(RESERVATIONS_COLLECTION);
  }

  public async reserveProductStock({
    productId,
    quantity,
  }: {
    productId: ObjectId;
    quantity: number;
  }): Promise<WithId<Product> | null> {
    return this.products.findOneAndUpdate(
      {
        _id: productId,
        status: "active",
        stock: { $gte: quantity },
      },
      {
        $inc: { stock: -quantity },
        $set: { updatedAt: new Date() },
      },
      { returnDocument: "after" },
    );
  }

  public async releaseProductStock({
    productId,
    quantity,
  }: {
    productId: ObjectId;
    quantity: number;
  }): Promise<void> {
    await this.products.updateOne(
      { _id: productId },
      {
        $inc: { stock: quantity },
        $set: { updatedAt: new Date() },
      },
    );
  }

  public async insertReservation(
    reservation: OptionalId<StockReservation>,
  ): Promise<void> {
    await this.reservations.insertOne(reservation);
  }

  public async findReservedByOrderId(
    orderId: ObjectId,
  ): Promise<WithId<StockReservation>[]> {
    return this.reservations
      .find({
        orderId,
        status: "reserved",
      })
      .toArray();
  }

  public async releaseReservationsByOrderId(orderId: ObjectId): Promise<void> {
    await this.reservations.updateMany(
      {
        orderId,
        status: "reserved",
      },
      {
        $set: {
          releasedAt: new Date(),
          status: "released",
          updatedAt: new Date(),
        },
      },
    );
  }
}
