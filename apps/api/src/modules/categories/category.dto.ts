import { z } from "zod";
import { CATEGORY_STATUSES } from "./category.model";

export const createCategoryDto = z.object({
  description: z.string().trim().optional(),
  name: z.string().trim().min(1),
  parentId: z.string().trim().min(1).optional(),
  slug: z.string().trim().min(1).optional(),
  status: z.enum(CATEGORY_STATUSES).default("active"),
});

export const updateCategoryDto = z.object({
  description: z.string().trim().optional(),
  name: z.string().trim().min(1).optional(),
  parentId: z.string().trim().min(1).optional(),
  slug: z.string().trim().min(1).optional(),
  status: z.enum(CATEGORY_STATUSES).optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field is required" },
);

export type CreateCategoryDto = z.infer<typeof createCategoryDto>;
export type UpdateCategoryDto = z.infer<typeof updateCategoryDto>;
