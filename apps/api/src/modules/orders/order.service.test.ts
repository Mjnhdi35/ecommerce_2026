import { ObjectId } from "mongodb";
import { describe, expect, it, vi } from "vitest";
import { OrderService } from "./order.service";

describe("OrderService", () => {
  it("marks pending payment orders as paid", async () => {
    const orderId = new ObjectId();
    const userId = new ObjectId();
    const auditService = { record: vi.fn() };
    const orderRepository = {
      findById: vi.fn().mockResolvedValue({
        _id: orderId,
        createdAt: new Date(),
        items: [],
        status: "pending_payment",
        subtotal: 100,
        total: 100,
        updatedAt: new Date(),
        userId,
      }),
      findByUserId: vi.fn(),
      insert: vi.fn(),
      markPaid: vi.fn().mockResolvedValue({ matchedCount: 1 }),
      update: vi.fn(),
    };
    const service = new OrderService({
      auditService,
      cartService: {} as never,
      inventoryService: {} as never,
      orderRepository,
      productService: {} as never,
    });

    await service.markPaid(orderId, userId.toHexString());

    expect(orderRepository.markPaid).toHaveBeenCalledWith(orderId);
    expect(auditService.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "ORDER_PAID",
        entityId: orderId,
        userId,
      }),
    );
  });
});
