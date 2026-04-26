import { describe, expect, it } from "vitest";
import { createProductDto, updateProductDto } from "./product.dto";

describe("product dto", () => {
  it("rejects empty product updates", () => {
    expect(updateProductDto.safeParse({}).success).toBe(false);
  });

  it("does not coerce empty or null price to zero", () => {
    expect(
      createProductDto.safeParse({
        name: "Product",
        price: "",
        stock: 1,
      }).success,
    ).toBe(false);
    expect(
      createProductDto.safeParse({
        name: "Product",
        price: null,
        stock: 1,
      }).success,
    ).toBe(false);
  });

  it("coerces numeric strings for price and stock", () => {
    const result = createProductDto.parse({
      name: "Product",
      price: "100",
      stock: "2",
    });

    expect(result.price).toBe(100);
    expect(result.stock).toBe(2);
  });
});
