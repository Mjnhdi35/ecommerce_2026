import { Request, Response } from "express";
import { HttpError } from "../../shared/errors/http-error";
import { Controller } from "../../shared/http/controller";
import { AuthenticatedRequest } from "../auth/auth.middleware";
import { createUserDto, updateUserDto, updateUserRoleDto } from "./user.dto";
import { UserService } from "./user.service";

export class UserController extends Controller {
  private userService: UserService;

  constructor({ userService }: { userService: UserService }) {
    super();
    this.userService = userService;
  }

  public getUsers = async (_req: Request, res: Response): Promise<void> => {
    const users = await this.userService.findAll();

    this.ok(res, users);
  };

  public updateUserRole = async (req: Request, res: Response): Promise<void> => {
    this.assertNotSelfMutation(req, "Cannot update your own role");

    const payload = updateUserRoleDto.parse(req.body);
    const user = await this.userService.update(
      this.requiredParam(req, "id", "Invalid user id"),
      { role: payload.role },
    );

    this.ok(res, user);
  };

  public getUserById = async (req: Request, res: Response): Promise<void> => {
    const user = await this.userService.findById(
      this.requiredParam(req, "id", "Invalid user id"),
    );

    this.ok(res, user);
  };

  public createUser = async (req: Request, res: Response): Promise<void> => {
    const payload = createUserDto.parse(req.body);
    const user = await this.userService.create(payload);

    this.created(res, user);
  };

  public updateUser = async (req: Request, res: Response): Promise<void> => {
    const payload = updateUserDto.parse(req.body);

    if (payload.role) {
      this.assertNotSelfMutation(req, "Cannot update your own role");
    }

    const user = await this.userService.update(
      this.requiredParam(req, "id", "Invalid user id"),
      payload,
    );

    this.ok(res, user);
  };

  public deleteUser = async (req: Request, res: Response): Promise<void> => {
    this.assertNotSelfMutation(req, "Cannot delete your own user");

    await this.userService.delete(
      this.requiredParam(req, "id", "Invalid user id"),
    );

    this.noContent(res);
  };

  private assertNotSelfMutation(req: Request, message: string): void {
    const authenticatedUser = (req as AuthenticatedRequest).user;

    if (
      authenticatedUser &&
      authenticatedUser.id === this.requiredParam(req, "id", "Invalid user id")
    ) {
      throw new HttpError(400, message);
    }
  }
}
