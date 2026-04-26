import { z } from "zod";

export const createPaymentIntentDto = z.object({
  orderId: z.string().trim().min(1),
});

export type CreatePaymentIntentDto = z.infer<typeof createPaymentIntentDto>;
