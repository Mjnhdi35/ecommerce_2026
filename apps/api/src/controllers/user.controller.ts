import { Request, Response } from "express";
import { z } from "zod";
import { container } from "../container";
import { HttpError, UserService } from "../services/user.service";

const createUserSchema = z.object({
  username: z.string().trim().min(1),
  email: z.email().trim(),
  password: z.string().min(6),
});

const updateUserSchema = createUserSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field is required" },
);

export class UserController {
  public getUsers = async (_req: Request, res: Response): Promise<void> => {
    const userService = container.resolve<UserService>("userService");
    const users = await userService.findAll();

    res.json({
      status: "OK",
      data: users,
    });
  };

  public getUserById = async (req: Request, res: Response): Promise<void> => {
    const userService = container.resolve<UserService>("userService");
    const user = await userService.findById(this.getIdParam(req));

    res.json({
      status: "OK",
      data: user,
    });
  };

  public createUser = async (req: Request, res: Response): Promise<void> => {
    const userService = container.resolve<UserService>("userService");
    const payload = createUserSchema.parse(req.body);
    const user = await userService.create(payload);

    res.status(201).json({
      status: "OK",
      data: user,
    });
  };

  public updateUser = async (req: Request, res: Response): Promise<void> => {
    const userService = container.resolve<UserService>("userService");
    const payload = updateUserSchema.parse(req.body);
    const user = await userService.update(this.getIdParam(req), payload);

    res.json({
      status: "OK",
      data: user,
    });
  };

  public deleteUser = async (req: Request, res: Response): Promise<void> => {
    const userService = container.resolve<UserService>("userService");
    await userService.delete(this.getIdParam(req));

    res.status(204).send();
  };

  public handleError = (error: unknown, res: Response): void => {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        status: "ERROR",
        message: "Invalid request body",
        errors: error.issues,
      });
      return;
    }

    if (error instanceof HttpError) {
      res.status(error.statusCode).json({
        status: "ERROR",
        message: error.message,
      });
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
