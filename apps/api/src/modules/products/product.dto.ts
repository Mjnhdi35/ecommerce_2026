import { z } from "zod";
import { PRODUCT_STATUSES } from "./product.model";

export const createProductDto = z.object({
  name: z.string().trim().min(1),
  slug: z.string().trim().min(1).optional(),
  description: z.string().trim().optional(),
  price: z.coerce.number().min(0),
  stock: z.coerce.number().int().min(0),
  category: z.string().trim().min(1).optional(),
  images: z.array(z.url()).default([]),
  status: z.enum(PRODUCT_STATUSES).default("draft"),
});

export const updateProductDto = createProductDto.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field is required" },
);

export const productQueryDto = z.object({
  category: z.string().trim().min(1).optional(),
  status: z.enum(PRODUCT_STATUSES).optional(),
  search: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateProductDto = z.infer<typeof createProductDto>;
export type UpdateProductDto = z.infer<typeof updateProductDto>;
export type ProductQueryDto = z.infer<typeof productQueryDto>;
