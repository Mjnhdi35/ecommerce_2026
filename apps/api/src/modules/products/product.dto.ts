import { z } from "zod";
import { PRODUCT_STATUSES } from "./product.model";

const requestNumberDto = z.union([
  z.number(),
  z.string().trim().min(1).pipe(z.coerce.number()),
]);

const priceDto = requestNumberDto.pipe(z.number().finite().min(0));
const stockDto = requestNumberDto.pipe(z.number().int().min(0));

const productPayloadDto = z.object({
  name: z.string().trim().min(1),
  slug: z.string().trim().min(1).optional(),
  description: z.string().trim().optional(),
  price: priceDto,
  stock: stockDto,
  category: z.string().trim().min(1).optional(),
  images: z.array(z.url()).optional(),
  status: z.enum(PRODUCT_STATUSES).optional(),
});

export const createProductDto = productPayloadDto.extend({
  images: z.array(z.url()).default([]),
  status: z.enum(PRODUCT_STATUSES).default("draft"),
});

export const updateProductDto = productPayloadDto.partial().refine(
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
