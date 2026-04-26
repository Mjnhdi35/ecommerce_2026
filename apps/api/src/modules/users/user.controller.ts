import { Request, Response } from "express";
import { z } from "zod";
import { HttpError } from "../../shared/errors/http-error";
import { ApiResponse } from "../../shared/http/response";
import { USER_ROLES } from "./user.model";
import { UserService } from "./user.service";

const createUserSchema = z.object({
  username: z.string().trim().min(1),
  email: z.email().trim(),
  password: z.string().min(6),
  role: z.enum(USER_ROLES).optional(),
});

const updateUserSchema = createUserSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field is required" },
);

export class UserController {
  private userService: UserService;

  constructor({ userService }: { userService: UserService }) {
    this.userService = userService;
  }

  public getUsers = async (_req: Request, res: Response): Promise<void> => {
    const users = await this.userService.findAll();

    ApiResponse.success(res, users);
  };

  public updateUserRole = async (req: Request, res: Response): Promise<void> => {
    const payload = z.object({ role: z.enum(USER_ROLES) }).parse(req.body);
    const user = await this.userService.update(this.getIdParam(req), {
      role: payload.role,
    });

    ApiResponse.success(res, user);
  };

  public getUserById = async (req: Request, res: Response): Promise<void> => {
    const user = await this.userService.findById(this.getIdParam(req));

    ApiResponse.success(res, user);
  };

  public createUser = async (req: Request, res: Response): Promise<void> => {
    const payload = createUserSchema.parse(req.body);
    const user = await this.userService.create(payload);

    ApiResponse.success(res, user, 201);
  };

  public updateUser = async (req: Request, res: Response): Promise<void> => {
    const payload = updateUserSchema.parse(req.body);
    const user = await this.userService.update(this.getIdParam(req), payload);

    ApiResponse.success(res, user);
  };

  public deleteUser = async (req: Request, res: Response): Promise<void> => {
    await this.userService.delete(this.getIdParam(req));

    ApiResponse.noContent(res);
  };

  public handleError = (error: unknown, res: Response): void => {
    if (error instanceof z.ZodError) {
      ApiResponse.error(res, "Invalid request body", 400, error.issues);
      return;
    }

    if (error instanceof HttpError) {
      ApiResponse.error(res, error.message, error.statusCode);
      return;
    }

    throw error;
  };

  private getIdParam(req: Request): string {
    const { id } = req.params;

    if (typeof id !== "string") {
      throw new HttpError(400, "Invalid user id");
    }

    return id;
  }
}
