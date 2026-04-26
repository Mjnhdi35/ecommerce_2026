import { z } from "zod";
import { USER_ROLES } from "./user.model";

export const createUserDto = z.object({
  username: z.string().trim().min(1),
  email: z.email().trim().toLowerCase(),
  password: z.string().min(6),
  role: z.enum(USER_ROLES).optional(),
});

export const updateUserDto = createUserDto.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field is required" },
);

export const updateUserRoleDto = z.object({
  role: z.enum(USER_ROLES),
});

export type CreateUserDto = z.infer<typeof createUserDto>;
export type UpdateUserDto = z.infer<typeof updateUserDto>;
export type UpdateUserRoleDto = z.infer<typeof updateUserRoleDto>;
