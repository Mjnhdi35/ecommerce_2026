import { ObjectId } from "mongodb";
import { describe, expect, it, vi } from "vitest";
import { ProductService } from "./product.service";

const createService = () => {
  const productRepository = {
    delete: vi.fn(),
    findAll: vi.fn(),
    findById: vi.fn(),
    findBySlug: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
  };

  return {
    productRepository,
    productService: new ProductService({ productRepository }),
  };
};

describe("ProductService", () => {
  it("normalizes Vietnamese product names into stable slugs", async () => {
    const { productRepository, productService } = createService();
    const insertedId = new ObjectId();

    productRepository.insert.mockResolvedValue(insertedId);
    productRepository.findById.mockResolvedValue({
      _id: insertedId,
      images: [],
      name: "Ca phe sua da",
      price: 100,
      slug: "ca-phe-sua-da",
      status: "draft",
      stock: 1,
    });

    await productService.create({
      name: "Cà phê sữa đá",
      price: 100,
      stock: 1,
    });

    expect(productRepository.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: "ca-phe-sua-da",
      }),
    );
  });

  it("escapes search text before building regex filters", async () => {
    const { productRepository, productService } = createService();

    productRepository.findAll.mockResolvedValue({ items: [], total: 0 });

    await productService.findAll({ search: ".*", page: 1, limit: 20 });

    expect(productRepository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: {
          $or: [
            { name: { $options: "i", $regex: "\\.\\*" } },
            { description: { $options: "i", $regex: "\\.\\*" } },
          ],
        },
      }),
    );
  });
});
