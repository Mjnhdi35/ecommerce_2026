import { z } from "zod";

export const registerDto = z.object({
  username: z.string().trim().min(1),
  email: z.email().trim(),
  password: z.string().min(6),
});

export const loginDto = registerDto.pick({
  email: true,
  password: true,
});

export const refreshTokenDto = z.object({
  refreshToken: z.string().min(1),
});

export const updateMeDto = z.object({
  username: z.string().trim().min(1).optional(),
  email: z.email().trim().optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field is required" },
);

export const changePasswordDto = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

export type RegisterDto = z.infer<typeof registerDto>;
export type LoginDto = z.infer<typeof loginDto>;
export type RefreshTokenDto = z.infer<typeof refreshTokenDto>;
export type UpdateMeDto = z.infer<typeof updateMeDto>;
export type ChangePasswordDto = z.infer<typeof changePasswordDto>;
