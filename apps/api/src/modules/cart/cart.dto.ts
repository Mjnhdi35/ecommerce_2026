import { z } from "zod";

export const cartItemDto = z.object({
  productId: z.string().trim().min(1),
  quantity: z.number().int().min(1),
});

export const updateCartItemDto = z.object({
  quantity: z.number().int().min(1),
});

export type CartItemDto = z.infer<typeof cartItemDto>;
export type UpdateCartItemDto = z.infer<typeof updateCartItemDto>;
