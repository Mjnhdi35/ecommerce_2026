import { Request, Response } from "express";
import { HttpError } from "../errors/http-error";
import { ApiResponse } from "./response";

interface RequestWithUser extends Request {
  user?: {
    id: string;
  };
}

export abstract class Controller {
  protected ok<T>(res: Response, data: T): void {
    ApiResponse.success(res, data);
  }

  protected created<T>(res: Response, data: T): void {
    ApiResponse.success(res, data, 201);
  }

  protected noContent(res: Response): void {
    ApiResponse.noContent(res);
  }

  protected requiredParam(req: Request, name: string, message: string): string {
    const value = req.params[name];

    if (typeof value !== "string" || value.length === 0) {
      throw new HttpError(400, message);
    }

    return value;
  }

  protected userId(req: RequestWithUser): string {
    if (!req.user) {
      throw new HttpError(401, "Authentication is required");
    }

    return req.user.id;
  }
}
