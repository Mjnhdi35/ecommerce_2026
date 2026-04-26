import { Request, Response } from "express";
import { z } from "zod";
import { HttpError } from "../../shared/errors/http-error";
import { ApiResponse } from "../../shared/http/response";
import { AuthenticatedRequest } from "../auth/auth.middleware";
import { createUserDto, updateUserDto, updateUserRoleDto } from "./user.dto";
import { UserService } from "./user.service";

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
    this.assertNotSelfMutation(req, "Cannot update your own role");

    const payload = updateUserRoleDto.parse(req.body);
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
    const payload = createUserDto.parse(req.body);
    const user = await this.userService.create(payload);

    ApiResponse.success(res, user, 201);
  };

  public updateUser = async (req: Request, res: Response): Promise<void> => {
    const payload = updateUserDto.parse(req.body);

    if (payload.role) {
      this.assertNotSelfMutation(req, "Cannot update your own role");
    }

    const user = await this.userService.update(this.getIdParam(req), payload);

    ApiResponse.success(res, user);
  };

  public deleteUser = async (req: Request, res: Response): Promise<void> => {
    this.assertNotSelfMutation(req, "Cannot delete your own user");

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

  private assertNotSelfMutation(req: Request, message: string): void {
    const authenticatedUser = (req as AuthenticatedRequest).user;

    if (authenticatedUser && authenticatedUser.id === this.getIdParam(req)) {
      throw new HttpError(400, message);
    }
  }
}
